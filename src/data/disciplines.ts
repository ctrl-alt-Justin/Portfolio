export interface ProjectBuild {
  id: string;
  buildLabel: string;
  title: string;
  category: string;
  roleTags: string[];
  description: string;
  highlights: string[];
  stack: string[];
  media: string[];
  mediaGradient: string;
  liveUrl?: string;
  privateBadge?: string;
}

export interface Discipline {
  slug: string;
  index: string;
  title: string;
  summary: string;
  primaryTags: string[];
  stack: string[];
  previewMedia: string;
  previewLabel: string;
  previewGradient: string;
  builds: ProjectBuild[];
}

export function isVideoMedia(src: string): boolean {
  return /\.(mp4|webm|mov|ogg)$/i.test(src);
}

export const DISCIPLINES: Discipline[] = [
  {
    slug: "full-stack",
    index: "01",
    title: "Full-Stack Systems & Commercial Platforms",
    summary:
      "Production commercial web platforms, automated B2B quoting engines, and unified e-commerce/CRM operations.",
    primaryTags: ["Next.js", "Supabase", "PostgreSQL"],
    stack: [
      "Next.js",
      "TypeScript",
      "React",
      "Supabase",
      "PostgreSQL",
      "Tailwind CSS",
    ],
    previewMedia: "/featured/E-Commerce%201.png",
    previewLabel: "COMMERCIAL SYSTEMS // 01",
    previewGradient:
      "radial-gradient(85% 75% at 20% 20%, rgba(148, 163, 184, 0.16) 0%, rgba(24, 24, 27, 0.92) 55%, rgba(10, 10, 12, 1) 100%)",
    builds: [
      {
        id: "b2b-quotation-generator",
        buildLabel: "BUILD 01",
        title: "B2B Quotation Generator",
        category: "Commercial Quoting Engine",
        roleTags: ["Full-Stack", "Product Systems"],
        description:
          "Dynamic commercial quoting platform featuring real-time pricing calculators, tier/volume discount rules, live split-screen document preview, and built-in digital signature input.",
        highlights: [
          "Real-time reactive pricing engine evaluating tier and volume discount rules, tax breakdowns, and unit margins instantaneously.",
          "Live split-screen document preview syncing structured line-item edits directly into print-faithful commercial quotation layouts.",
          "Built-in digital signature capture and persistent approval records built with Next.js, TypeScript, and Supabase.",
        ],
        stack: [
          "Next.js",
          "TypeScript",
          "React",
          "Supabase",
          "PostgreSQL",
          "Tailwind CSS",
        ],
        liveUrl: "https://lgzquotations.vercel.app/",
        media: ["/featured/quotation-1.png"],
        mediaGradient:
          "radial-gradient(75% 80% at 78% 18%, rgba(228, 228, 231, 0.14) 0%, rgba(24, 24, 27, 0.92) 52%, rgba(9, 9, 11, 1) 100%)",
      },
      {
        id: "commercial-ecommerce-crm",
        buildLabel: "BUILD 02",
        title: "Commercial E-Commerce & Unified CRM Platform",
        category: "Storefront & Unified CRM",
        roleTags: ["System Architect", "E-Commerce"],
        description:
          "End-to-end storefront (ETJO Aigi Trading) integrated directly with customer relationship management, inventory tracking, and order workflows.",
        highlights: [
          "Full-stack ETJO Aigi Trading storefront with dynamic catalog filtering, cart persistence, and validated checkout flows.",
          "Unified CRM pipeline linking customer accounts, sales touchpoints, and repeat order history in PostgreSQL.",
          "Real-time inventory synchronization and fulfillment state transitions driving commercial operations from a single schema.",
        ],
        stack: [
          "Next.js",
          "TypeScript",
          "React",
          "Supabase",
          "PostgreSQL",
          "Tailwind CSS",
        ],
        liveUrl: "https://etjoaigitrading.vercel.app/shop",
        media: [
          "/featured/E-Commerce%201.png",
          "/featured/E-Commerce2.png",
          "/featured/BackOffice.png",
        ],
        mediaGradient:
          "radial-gradient(80% 70% at 18% 82%, rgba(161, 161, 170, 0.14) 0%, rgba(20, 20, 24, 0.94) 56%, rgba(9, 9, 11, 1) 100%)",
      },
    ],
  },
  {
    slug: "applied-ai",
    index: "02",
    title: "Applied AI & RAG Tutoring Systems",
    summary:
      "Retrieval-augmented pedagogical AI and interactive learning architectures designed to build real mastery.",
    primaryTags: ["RAG Pipeline", "Gemini API", "Vector Search"],
    stack: [
      "RAG Pipeline",
      "Gemini API",
      "Next.js",
      "Supabase",
      "Vector Search",
      "TypeScript",
    ],
    previewMedia: "/featured/RisseAILMS.png",
    previewLabel: "RISSE AI LMS // 02",
    previewGradient:
      "radial-gradient(85% 75% at 75% 25%, rgba(129, 140, 248, 0.16) 0%, rgba(20, 20, 26, 0.92) 55%, rgba(10, 10, 12, 1) 100%)",
    builds: [
      {
        id: "risse-ai-lms-socratic-rag",
        buildLabel: "BUILD 01",
        title: "Risse — AI LMS & Socratic RAG Tutor",
        category: "Gamified LMS & Pedagogical RAG",
        roleTags: ["Lead Engineer", "AI Systems"],
        description:
          "Private AI-integrated Learning Management System featuring star-chart skill trees and a custom Retrieval-Augmented Generation (RAG) Socratic tutor that guides learners step-by-step through questioning rather than handing out direct answers.",
        highlights: [
          "Interactive star-chart skill trees visualizing curriculum prerequisites, mastery progression, and student telemetry inside a full Next.js & Supabase LMS.",
          "Curriculum-grounded vector search retrieving verified lesson context into the Gemini API pipeline so explanations stay faithful to course material.",
          "Socratic reasoning layer engineered to diagnose learner misconceptions and respond with progressive hints and targeted questions instead of direct answers.",
        ],
        stack: [
          "RAG Pipeline",
          "Gemini API",
          "Next.js",
          "Supabase",
          "Vector Search",
          "TypeScript",
        ],
        privateBadge: "Private System — Media Preview",
        media: ["/featured/RisseAILMS.png"],
        mediaGradient:
          "radial-gradient(80% 75% at 30% 25%, rgba(129, 140, 248, 0.16) 0%, rgba(18, 18, 24, 0.93) 56%, rgba(9, 9, 11, 1) 100%)",
      },
    ],
  },
  {
    slug: "edge-iot",
    index: "03",
    title: "Edge IoT, CAD & Hardware Prototyping",
    summary:
      "Power-constrained embedded wearables, parametric 3D CAD engineering, custom enclosures, and competition robotics drivetrains.",
    primaryTags: ["ESP32-S3", "Fusion 360", "Flutter"],
    stack: [
      "ESP32-S3 Sense",
      "FreeRTOS",
      "Fusion 360",
      "OnShape",
      "SolidWorks",
      "CAD",
      "Flutter",
      "FastAPI",
      "Bambu Lab P1S",
      "VEX V5",
    ],
    previewMedia: "/featured/Drivetrain.png",
    previewLabel: "HARDWARE & CAD // 03",
    previewGradient:
      "radial-gradient(85% 75% at 22% 75%, rgba(245, 158, 11, 0.13) 0%, rgba(22, 20, 20, 0.93) 56%, rgba(10, 10, 12, 1) 100%)",
    builds: [
      {
        id: "securelink-wearable-flutter-suite",
        buildLabel: "BUILD 01",
        title: "SecureLink Wearable Pin & Flutter Monitoring Suite",
        category: "Wearable IoT & Command Dashboard",
        roleTags: ["Firmware & CAD", "Flutter Systems"],
        description:
          "Underclocked XIAO ESP32-S3 Sense wearable safety pin (I2S PDM audio, OV2640 camera, BLE bridging, and friction-fit Fusion 360 CAD enclosure) paired with a cross-platform Flutter desktop and mobile monitoring dashboard.",
        highlights: [
          "FreeRTOS firmware on an underclocked XIAO ESP32-S3 Sense managing I2S PDM audio, on-demand OV2640 frame capture, and low-overhead BLE bridging.",
          "Modular friction-fit wearable shell modeled in Fusion 360 and tolerance-tuned on a Bambu Lab P1S for clean acoustic intake and discreet mounting.",
          "Cross-platform Flutter desktop and mobile dashboard streaming live FastAPI WebSocket threat alerts, device telemetry, and danger-event snapshots.",
        ],
        stack: [
          "ESP32-S3 Sense",
          "FreeRTOS",
          "Fusion 360",
          "Flutter",
          "FastAPI",
          "Bambu Lab P1S",
        ],
        media: ["/featured/securelink-1.png"],
        mediaGradient:
          "radial-gradient(75% 75% at 72% 24%, rgba(245, 158, 11, 0.13) 0%, rgba(22, 20, 20, 0.94) 55%, rgba(9, 9, 11, 1) 100%)",
      },
      {
        id: "vex-u-drivetrain-cad-assemblies",
        buildLabel: "BUILD 02",
        title: "VEX U Competition Drivetrain & Custom CAD Assemblies",
        category: "Parametric CAD & Robotics",
        roleTags: ["Mechanical CAD", "Drivetrain"],
        description:
          "Parametric 3D CAD chassis modeling, custom 8-motor drivetrain architecture, and 3D-printed gearing engineered for university robotics competition.",
        highlights: [
          "Full parametric 3D CAD assembly workflows across Fusion 360, OnShape, and SolidWorks balancing structural rigidity with rapid iteration.",
          "Custom 8-motor VEX V5 drivetrain architecture optimized for high-torque acceleration, traction, and center-of-gravity stability.",
          "Custom 3D-printed gearing and bearing-retained plates fabricated on Bambu Lab P1S to withstand competitive match loads.",
        ],
        stack: [
          "Fusion 360",
          "OnShape",
          "SolidWorks",
          "CAD",
          "Bambu Lab P1S",
          "VEX V5",
        ],
        media: ["/featured/Drivetrain.png"],
        mediaGradient:
          "radial-gradient(80% 70% at 24% 25%, rgba(251, 191, 36, 0.11) 0%, rgba(20, 20, 22, 0.94) 56%, rgba(9, 9, 11, 1) 100%)",
      },
    ],
  },
  {
    slug: "3d-motion",
    index: "04",
    title: "3D Environments & Commercial Motion",
    summary:
      "Photorealistic commercial product animation, stylized isometric architecture, and real-time 3D environments.",
    primaryTags: ["Unreal Engine 5", "Blender", "Cycles"],
    stack: [
      "Unreal Engine 5",
      "Blender",
      "Cycles/Eevee",
      "CAD-to-3D Pipeline",
      "Lighting & Shading",
    ],
    previewMedia: "/featured/ue5-environment.png",
    previewLabel: "3D & MOTION // 04",
    previewGradient:
      "radial-gradient(85% 75% at 50% 15%, rgba(244, 244, 246, 0.15) 0%, rgba(20, 20, 24, 0.92) 52%, rgba(9, 9, 11, 1) 100%)",
    builds: [
      {
        id: "ue5-realtime-game-environment",
        buildLabel: "BUILD 01",
        title: "Real-Time Game Environment (Unreal Engine 5)",
        category: "Real-Time Level Design",
        roleTags: ["Environment Artist", "UE5 Lighting"],
        description:
          "Atmospheric 3D level design, modular environment assembly, custom lighting, and real-time post-processing built in Unreal Engine 5.",
        highlights: [
          "Modular architectural environment assembly built for cohesive spatial flow, sightlines, and real-time frame-rate budgets.",
          "Atmospheric lighting rigs, volumetric fog, and custom material shading tuned for mood and silhouette readability.",
          "Real-time post-processing color grading and exposure pipelines delivering cinema-grade framing in Unreal Engine 5.",
        ],
        stack: ["Unreal Engine 5", "CAD-to-3D Pipeline", "Lighting & Shading"],
        media: ["/featured/ue5-environment.png"],
        mediaGradient:
          "radial-gradient(75% 75% at 75% 20%, rgba(244, 244, 246, 0.14) 0%, rgba(18, 18, 22, 0.93) 54%, rgba(9, 9, 11, 1) 100%)",
      },
      {
        id: "blender-stylized-isometric-room",
        buildLabel: "BUILD 02",
        title: "Stylized Isometric Room (Blender)",
        category: "Isometric Lookdev & Cycles",
        roleTags: ["3D Modeler", "Cycles Lookdev"],
        description:
          "Detailed isometric interior diorama featuring custom 3D modeling, procedural materials, warm volumetric lighting, and Cycles rendering in Blender.",
        highlights: [
          "Custom hard-surface and prop modeling arranged inside a clean, readable isometric architectural diorama.",
          "Procedural surface shaders balancing subtle roughness variation, wood/fabric micro-texture, and emissive accents.",
          "Warm volumetric lighting and soft bounce illumination path-traced in Blender Cycles for editorial depth.",
        ],
        stack: ["Blender", "Cycles/Eevee", "Lighting & Shading"],
        media: ["/featured/blender-isometric.png"],
        mediaGradient:
          "radial-gradient(80% 75% at 25% 75%, rgba(212, 212, 216, 0.13) 0%, rgba(18, 18, 22, 0.94) 55%, rgba(9, 9, 11, 1) 100%)",
      },
    ],
  },
];

export function getDisciplineBySlug(slug: string | null): Discipline | null {
  if (!slug) return null;
  return DISCIPLINES.find((item) => item.slug === slug) ?? null;
}
