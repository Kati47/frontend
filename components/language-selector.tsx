"use client";

import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation, SUPPORTED_LANGUAGES } from "@/lib/i18n/client";

export function LanguageSelector() {
  const { locale, changeLocale } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          <span>{SUPPORTED_LANGUAGES[locale as keyof typeof SUPPORTED_LANGUAGES]?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, { name, flag }]) => (
          <DropdownMenuItem 
            key={code} 
            onClick={() => changeLocale(code)}
            className={locale === code ? "bg-muted font-medium" : ""}
          >
            <span className="mr-2">{flag}</span>
            <span>{name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}