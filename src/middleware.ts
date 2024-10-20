export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/portal-administrador/:path*", 
    "/portal-siagie/:path*", 
    "/portal-usuario/:path*", 
    "/portal-caja/:path*",
    "/portal-mesapartes/:path*",],
};
