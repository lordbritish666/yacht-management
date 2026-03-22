-- ============================================================
-- Telaga Marina App — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text not null,
  role text not null check (role in ('superadmin', 'harbour_master', 'staff')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view all profiles" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "Superadmin can manage profiles" on public.profiles
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'superadmin'
    )
  );

create policy "Users can update own profile" on public.profiles
  for update using (id = auth.uid());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'staff')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- BERTHS
-- ============================================================
create table public.berths (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  name text not null,
  category text not null check (category in ('sailboat', 'motor', 'large', 'mega')),
  length_m numeric(5,1) not null,
  width_m numeric(5,1) not null,
  depth_m numeric(5,1) not null,
  is_active boolean default true,
  notes text,
  created_at timestamptz default now()
);

alter table public.berths enable row level security;

create policy "All authenticated users can view berths" on public.berths
  for select using (auth.role() = 'authenticated');

create policy "Superadmin can manage berths" on public.berths
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'superadmin'
    )
  );

-- ============================================================
-- BOOKINGS
-- ============================================================
create table public.bookings (
  id uuid primary key default uuid_generate_v4(),
  berth_id uuid references public.berths(id) not null,
  vessel_name text not null,
  vessel_type text not null,
  vessel_length_m numeric(5,1) not null,
  owner_name text not null,
  owner_contact text not null,
  arrival_date date not null,
  departure_date date not null,
  status text not null default 'upcoming'
    check (status in ('upcoming', 'active', 'completed', 'cancelled')),
  notes text,
  created_by uuid references public.profiles(id) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint valid_dates check (departure_date > arrival_date)
);

alter table public.bookings enable row level security;

create policy "All authenticated users can view bookings" on public.bookings
  for select using (auth.role() = 'authenticated');

create policy "Staff and above can create bookings" on public.bookings
  for insert with check (auth.role() = 'authenticated');

create policy "Staff and above can update bookings" on public.bookings
  for update using (auth.role() = 'authenticated');

create policy "Harbour master and above can delete bookings" on public.bookings
  for delete using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('superadmin', 'harbour_master')
    )
  );

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- VESSEL MOVEMENTS
-- ============================================================
create table public.vessel_movements (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references public.bookings(id) on delete cascade not null,
  berth_id uuid references public.berths(id) not null,
  type text not null check (type in ('checkin', 'departure', 'return', 'checkout')),
  timestamp timestamptz default now(),
  reason text,
  notes text,
  recorded_by uuid references public.profiles(id) not null,
  created_at timestamptz default now()
);

alter table public.vessel_movements enable row level security;

create policy "All authenticated users can view movements" on public.vessel_movements
  for select using (auth.role() = 'authenticated');

create policy "All authenticated users can insert movements" on public.vessel_movements
  for insert with check (auth.role() = 'authenticated');

-- ============================================================
-- BERTH STATUS VIEW
-- Computes live berth status from bookings + movements
-- ============================================================
create or replace view public.berth_status as
select
  b.id,
  b.code,
  b.name,
  b.category,
  b.length_m,
  b.width_m,
  b.depth_m,
  b.is_active,
  b.notes,
  case
    when bk.id is null then 'vacant'
    when bk.status = 'upcoming' then 'reserved'
    when bk.status = 'active' then
      case
        when (
          select vm.type from public.vessel_movements vm
          where vm.booking_id = bk.id
          order by vm.timestamp desc
          limit 1
        ) = 'departure' then 'away'
        else 'occupied'
      end
    else 'vacant'
  end as status,
  bk.id as booking_id,
  bk.vessel_name,
  bk.owner_name,
  bk.arrival_date,
  bk.departure_date,
  bk.status as booking_status
from public.berths b
left join public.bookings bk on (
  bk.berth_id = b.id
  and bk.status in ('upcoming', 'active')
  and bk.arrival_date <= current_date
  and bk.departure_date >= current_date
  -- For upcoming: arrival is today or in future
  -- Pick the most current active/upcoming booking
)
where b.is_active = true
order by b.code;

-- ============================================================
-- SEED: Berths
-- ============================================================
insert into public.berths (code, name, category, length_m, width_m, depth_m) values
  ('A-01','Berth A-01','sailboat',10.0,3.5,2.5),
  ('A-02','Berth A-02','sailboat',10.0,3.5,2.5),
  ('A-03','Berth A-03','sailboat',11.0,3.5,2.5),
  ('A-04','Berth A-04','sailboat',11.0,3.5,2.5),
  ('A-05','Berth A-05','sailboat',12.0,4.0,2.5),
  ('A-06','Berth A-06','sailboat',12.0,4.0,2.5),
  ('A-07','Berth A-07','sailboat',10.0,3.5,2.5),
  ('A-08','Berth A-08','sailboat',10.0,3.5,2.5),
  ('A-09','Berth A-09','sailboat',11.0,3.5,2.8),
  ('A-10','Berth A-10','sailboat',12.0,4.0,2.8),
  ('B-01','Berth B-01','motor',14.0,5.0,3.0),
  ('B-02','Berth B-02','motor',14.0,5.0,3.0),
  ('B-03','Berth B-03','motor',16.0,5.5,3.0),
  ('B-04','Berth B-04','motor',16.0,5.5,3.0),
  ('B-05','Berth B-05','motor',18.0,6.0,3.2),
  ('B-06','Berth B-06','motor',18.0,6.0,3.2),
  ('B-07','Berth B-07','motor',20.0,6.0,3.5),
  ('B-08','Berth B-08','motor',20.0,6.0,3.5),
  ('B-09','Berth B-09','motor',15.0,5.0,3.0),
  ('B-10','Berth B-10','motor',17.0,5.5,3.2),
  ('C-01','Berth C-01','large',22.0,7.0,4.0),
  ('C-02','Berth C-02','large',25.0,7.5,4.0),
  ('C-03','Berth C-03','large',28.0,8.0,4.5),
  ('C-04','Berth C-04','large',28.0,8.0,4.5),
  ('C-05','Berth C-05','large',30.0,8.5,4.5),
  ('C-06','Berth C-06','large',32.0,9.0,5.0),
  ('C-07','Berth C-07','large',35.0,9.0,5.0),
  ('D-01','Berth D-01','mega',40.0,10.0,5.5),
  ('D-02','Berth D-02','mega',48.0,12.0,6.0),
  ('D-03','Berth D-03','mega',55.0,14.0,6.5);
