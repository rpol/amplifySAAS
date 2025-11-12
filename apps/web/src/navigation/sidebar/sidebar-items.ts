import {
  ShoppingBag,
  Forklift,
  Mail,
  MessageSquare,
  Calendar,
  Kanban,
  ReceiptText,
  Users,
  Lock,
  Fingerprint,
  SquareArrowUpRight,
  LayoutDashboard,
  ChartBar,
  Banknote,
  Gauge,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    // label: "Dashboards",
    items: [
      {
        title: "Inicio",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      {
        title: "Inventario",
        url: "/auth",
        icon: Fingerprint,
        subItems: [
          { title: "Artículos", url: "/auth/v1/login", newTab: true },
          { title: "Almacenes", url: "/auth/v1/login", newTab: true },
          { title: "Movimientos", url: "/auth/v2/login", newTab: true },
          { title: "Ajustes", url: "/auth/v1/register", newTab: true },
        ],
      },
      {
        title: "Ventas",
        url: "/auth",
        icon: Fingerprint,
        subItems: [
          { title: "Clientes", url: "/auth/v1/login", newTab: true },
          { title: "Cotizaciones", url: "/auth/v2/login", newTab: true },
          { title: "Facturación", url: "/auth/v1/register", newTab: true },
          { title: "Registrar pagos", url: "/auth/v2/register", newTab: true },
        ],
      },
      {
        title: "Compras",
        url: "/auth",
        icon: Fingerprint,
        subItems: [
          { title: "Proveedores", url: "/auth/v1/login", newTab: true },
          { title: "Ordenes de Compra", url: "/auth/v1/login", newTab: true },
          { title: "Facturas de Compra", url: "/auth/v2/login", newTab: true },
          {
            title: "Pago a Proveedores",
            url: "/auth/v1/register",
            newTab: true,
          },
          { title: "Manejo de Gastos", url: "/auth/v2/register", newTab: true },
        ],
      },
      {
        title: "Bancos",
        url: "/auth",
        icon: Fingerprint,
        subItems: [
          { title: "Cuentas Bancarias", url: "/auth/v1/login", newTab: true },
          {
            title: "Transacciones",
            url: "/auth/v1/login",
            newTab: true,
          },
          { title: "Conciliaciones", url: "/auth/v2/login", newTab: true },
        ],
      },
      {
        title: "Contabilidad",
        url: "/auth",
        icon: Fingerprint,
        subItems: [
          { title: "Catalogo de Cuentas", url: "/auth/v1/login", newTab: true },
          {
            title: "Asientos Contables",
            url: "/auth/v1/login",
            newTab: true,
          },
        ],
      },
      {
        title: "Reportes",
        url: "/auth",
        icon: Fingerprint,
        subItems: [
          {
            title: "Estado de Resultados",
            url: "/auth/v1/login",
            newTab: true,
          },
          {
            title: "Balance General",
            url: "/auth/v1/login",
            newTab: true,
          },
          {
            title: "Flujo de Efectivo",
            url: "/auth/v1/login",
            newTab: true,
          },
          {
            title: "Análisis de Ventas",
            url: "/auth/v1/login",
            newTab: true,
          },
          {
            title: "Cuentas por Cobrar",
            url: "/auth/v1/login",
            newTab: true,
          },
          {
            title: "Cuentas por Pagar",
            url: "/auth/v1/login",
            newTab: true,
          },
        ],
      },
      // {
      //   title: "CRM",
      //   url: "/dashboard/crm",
      //   icon: ChartBar,
      // },
      // {
      //   title: "Finance",
      //   url: "/dashboard/finance",
      //   icon: Banknote,
      // },
    ],
  },
  {
    id: 2,
    label: "Configuración",
    items: [
      {
        title: "Empresa",
        url: "/dashboard/coming-soon",
        icon: Mail,
        comingSoon: false,
      },
      {
        title: "Organizaciones",
        url: "/dashboard/coming-soon",
        icon: MessageSquare,
        comingSoon: false,
      },
      {
        title: "Usuaios y Roles",
        url: "/dashboard/coming-soon",
        icon: MessageSquare,
        comingSoon: false,
      },
      {
        title: "Preferencias Contables",
        url: "/dashboard/coming-soon",
        icon: Calendar,
        comingSoon: false,
      },
      {
        title: "Impuestos",
        url: "/dashboard/coming-soon",
        icon: Kanban,
        comingSoon: false,
      },
      // {
      //   title: "Authentication",
      //   url: "/auth",
      //   icon: Fingerprint,
      //   subItems: [
      //     { title: "Login v1", url: "/auth/v1/login", newTab: true },
      //     { title: "Login v2", url: "/auth/v2/login", newTab: true },
      //     { title: "Register v1", url: "/auth/v1/register", newTab: true },
      //     { title: "Register v2", url: "/auth/v2/register", newTab: true },
      //   ],
      // },
    ],
  },
  // {
  //   id: 3,
  //   label: "Misc",
  //   items: [
  //     {
  //       title: "Others",
  //       url: "/dashboard/coming-soon",
  //       icon: SquareArrowUpRight,
  //       comingSoon: true,
  //     },
  //   ],
  // },
];
