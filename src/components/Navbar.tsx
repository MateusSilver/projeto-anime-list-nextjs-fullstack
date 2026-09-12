"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOutIcon, Users, ListVideo } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getSessionUser, logoutAction } from "@/actions/authActions";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<{
    name: string;
    profileImageUrl?: string;
  } | null>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const isDetailsPage = pathname?.startsWith("/anime/") || false;

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getSessionUser();
      setUser(
        session as unknown as { name: string; profileImageUrl?: string } | null,
      );
    };
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    await logoutAction();
    sessionStorage.removeItem("meusAnimesCache");
    setUser(null);
    closeMenu();
    router.push("/login");
  };

  if (pathname === "/login" || pathname === "/register") return null;

  const isVisible = !isDetailsPage || isScrolled;
  const positionClass = isDetailsPage ? "fixed-top" : "sticky-top";

  return (
    <nav
      className={`navbar fixed-top navbar-expand-md navbar-light glass-navbar ${positionClass}`}
      style={{
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.3s ease-in-out",
        zIndex: 1040,
      }}
    >
      <div className="container py-1">
        <Link
          href="/"
          className="navbar-brand fw-bold d-flex align-items-center gap-2"
          onClick={closeMenu}
        >
          <span className="text-primary fs-4">My Anime List Pro</span>
        </Link>

        <button
          className="navbar-toggler border-0 shadow-none focus-ring focus-ring-danger"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Alternar menu de navegação"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}
          id="navbarMenu"
        >
          <ul className="navbar-nav me-auto mb-2 mb-md-0 ms-md-4 gap-2 mt-3 mt-md-0">
            <li className="nav-item">
              <Link
                href="/"
                onClick={closeMenu}
                className={`nav-link fw-medium d-flex align-items-center gap-1 ${
                  pathname === "/" ? "text-primary active" : ""
                }`}
              >
                <ListVideo size={18} /> Meu Acervo
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/users"
                onClick={closeMenu}
                className={`nav-link fw-medium d-flex align-items-center gap-1 ${
                  pathname?.startsWith("/users") ? "text-primary active" : ""
                }`}
              >
                <Users size={18} /> Comunidade
              </Link>
            </li>
          </ul>

          <div
            className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3 mt-3 mt-md-0 pt-3 pt-md-0"
            style={{ borderColor: "rgba(0,0,0,0.1)" }}
          >
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="text-decoration-none"
                  onClick={closeMenu}
                >
                  <div
                    className="d-flex align-items-center gap-2 hover-scale relative"
                    title="Meu Perfil"
                  >
                    <Image
                      src={
                        user.profileImageUrl ||
                        "https://placehold.co/150x150/png?text=User"
                      }
                      alt="Avatar"
                      className="rounded-circle border-primary"
                      style={{ objectFit: "cover" }}
                      width={35}
                      height={35}
                    />
                    <span className="d-md-none fw-semibold text-body">
                      Meu Perfil ({user.name})
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-sm btn-outline-danger fw-semibold rounded-pill px-3 d-flex align-items-center gap-1"
                >
                  <LogOutIcon size={16} />
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="btn btn-primary fw-semibold rounded-pill px-4 w-100 w-md-auto"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
