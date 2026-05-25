import type { ServiceSection, BibleVerse } from "@/types";
import { generateId } from "./utils";

export const defaultSections: ServiceSection[] = [];

export const defaultVerse: BibleVerse = {
  reference: "Johannes 3:16",
  text: "Denn also hat Gott die Welt geliebt, dass er seinen eingeborenen Sohn gab, damit alle, die an ihn glauben, nicht verloren gehen, sondern ewiges Leben haben.",
  translation: "Elberfelder",
};

export const quickVerses: BibleVerse[] = [
  {
    reference: "Psalm 46:2",
    text: "Gott ist unsere Zuflucht und Stärke, eine bewährte Hilfe in der Not.",
    translation: "Elberfelder",
  },
  {
    reference: "Philipper 4:13",
    text: "Ich vermag alles in dem, der mich stärkt — Christus.",
    translation: "Elberfelder",
  },
  {
    reference: "Matthäus 6:33",
    text: "Sucht aber zuerst das Reich Gottes und seine Gerechtigkeit, so wird euch das alles hinzugefügt werden.",
    translation: "Elberfelder",
  },
  {
    reference: "Römer 8:28",
    text: "Wir wissen aber, dass denen, die Gott lieben, alle Dinge zum Guten mitwirken.",
    translation: "Elberfelder",
  },
];
