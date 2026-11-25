"use client";

import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { TextPlugin } from "gsap/TextPlugin";

let pluginsRegistered = false;

if (typeof window !== "undefined" && !pluginsRegistered) {
  gsap.registerPlugin(TextPlugin, Flip);
  pluginsRegistered = true;
}

export { gsap, TextPlugin, Flip };
