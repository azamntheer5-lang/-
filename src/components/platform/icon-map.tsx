"use client";

// خريطة أيقونات الخدمات (مفاتيح مخزنة في قاعدة البيانات)
import {
  Award,
  BookOpen,
  BookOpenCheck,
  Camera,
  ClipboardList,
  FileSearch,
  FileText,
  FolderOpen,
  GraduationCap,
  Image,
  ImagePlus,
  Images,
  Languages,
  Lightbulb,
  NotebookPen,
  Palette,
  PenLine,
  Presentation,
  ScrollText,
  Search,
  Star,
  Calculator,
  FlaskConical,
  LayoutTemplate,
  Microscope,
  Globe,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  search: Search,
  book: BookOpen,
  "book-check": BookOpenCheck,
  note: NotebookPen,
  file: FileText,
  "file-search": FileSearch,
  presentation: Presentation,
  clipboard: ClipboardList,
  graduation: GraduationCap,
  languages: Languages,
  lightbulb: Lightbulb,
  pen: PenLine,
  scroll: ScrollText,
  award: Award,
  star: Star,
  folder: FolderOpen,
  calculator: Calculator,
  flask: FlaskConical,
  microscope: Microscope,
  globe: Globe,
  sparkles: Sparkles,
  images: Images,
  image: Image,
  "image-plus": ImagePlus,
  camera: Camera,
  palette: Palette,
  layout: LayoutTemplate,
};

export function serviceIcon(key: string): LucideIcon {
  return SERVICE_ICONS[key] ?? FolderOpen;
}

export const ICON_KEYS = Object.keys(SERVICE_ICONS);
