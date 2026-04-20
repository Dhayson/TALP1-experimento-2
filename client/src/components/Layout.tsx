import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <header>
        <nav>
          <NavLink to="/students">Students</NavLink>
          <NavLink to="/classes">Classes</NavLink>
        </nav>
      </header>
      <main className="container">
        {children}
      </main>
    </>
  );
}