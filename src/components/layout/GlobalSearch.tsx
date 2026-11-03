import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sun, Moon, Languages } from "lucide-react";
import { useTheme } from "next-themes";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/stores/i18nStore";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  const { setTheme } = useTheme();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    []
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hidden md:inline-flex"
        onClick={() => setOpen(true)}
        title={`${t("search")} (⌘K)`}
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">{t("search")}</span>
      </Button>

      {/* Mobile version */}
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full md:hidden"
        onClick={() => setOpen(true)}
      >
        <Search className="h-5 w-5" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t("search_pages")} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading={t("pages")}>
            <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
              {t("home")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/products"))}>
              {t("products")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/bundles"))}>
              {t("bundles")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/gift-cards"))}>
              {t("gift_cards")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/blog"))}>
              {t("blog")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/loyalty"))}>
              {t("rewards")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/track"))}>
              {t("track")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/profile"))}>
              {t("profile")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/wishlist"))}>
              {t("wishlist")}
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={t('settings') || "Preferences"}>
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun className="mr-2 h-4 w-4" />
              {lang === 'th' ? 'สว่าง' : 'Light Theme'}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon className="mr-2 h-4 w-4" />
              {lang === 'th' ? 'มืด' : 'Dark Theme'}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setLang(lang === 'th' ? 'en' : 'th'))}>
              <Languages className="mr-2 h-4 w-4" />
              {lang === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
