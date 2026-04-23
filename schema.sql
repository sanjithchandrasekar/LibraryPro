-- Users table
CREATE TYPE user_role AS ENUM ('Student', 'Faculty', 'Admin');

CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'Student',
  department TEXT,
  password TEXT,           -- stored for display/reference (not used for auth)
  roll_no TEXT,            -- student roll number
  dob DATE,                -- date of birth
  year TEXT,               -- academic year (e.g. "2nd Year")
  gender TEXT,             -- Male / Female / Other
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  category_id SERIAL PRIMARY KEY,
  category_name TEXT UNIQUE NOT NULL
);

-- Books table
CREATE TABLE books (
  book_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE NOT NULL,
  category_id INT REFERENCES categories(category_id) ON DELETE SET NULL,
  total_copies INT NOT NULL DEFAULT 0,
  available_copies INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Issues table
CREATE TYPE issue_status AS ENUM ('Issued', 'Returned');

CREATE TABLE issues (
  issue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(book_id) ON DELETE CASCADE,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  fine_amount NUMERIC DEFAULT 0,
  status issue_status NOT NULL DEFAULT 'Issued',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin table linked to Supabase auth.users
CREATE TABLE admin (
  admin_id UUID PRIMARY KEY, -- Links to auth.users.id
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) configuration

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users for dropdowns, etc.
CREATE POLICY "Enable read access for all authenticated users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert/update for all authenticated users" ON users FOR ALL TO authenticated USING (true); -- Simplifying for the mini project

CREATE POLICY "Enable read access for all authenticated users" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert/update access for all authenticated users" ON categories FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for all authenticated users" ON books FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert/update access for all authenticated users" ON books FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for all authenticated users" ON issues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert/update access for all authenticated users" ON issues FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read/write for associated admins" ON admin FOR ALL TO authenticated USING (true);

-- Enable Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE books;
ALTER PUBLICATION supabase_realtime ADD TABLE issues;
