export interface ProjectBuild {
  id: string;
  buildLabel: string;
  title: string;
  category: string;
  roleTags: string[];
  description: string;
  highlights: string[];
  stack: string[];
}

export interface Discipline {
  slug: string;
  index: string;
  title: string;
  summary: string;
  primaryTags: string[];
  stack: string[];
  builds: [ProjectBuild, ProjectBuild];
}

export const DISCIPLINES: Discipline[] = [
  {
    slug: "full-stack",
    index: "01",
    title: "Full-Stack Systems & Cloud Architecture",
    summary:
      "End-to-end web platforms, multi-tenant schemas, real-time dashboards, and B2B/SaaS infrastructure.",
    primaryTags: ["Next.js", "Supabase", "PostgreSQL", ".NET 10"],
    stack: [
      "Next.js",
      "TypeScript",
      "React",
      "Supabase",
      "PostgreSQL",
      ".NET 10",
      "Tailwind CSS",
    ],
    builds: [
      {
        id: "acamad-platform-suite",
        buildLabel: "BUILD 01",
        title: "Acamad Platform Suite",
        category: "Multi-App B2B Ecosystem",
        roleTags: ["System Architect", "Full-Stack"],
        description:
          "Multi-application ecosystem including a B2B Quotation Generator, CRM, Back Office, and E-Commerce storefront.",
        highlights: [
          "Unified multi-tenant PostgreSQL schema with row-level access policies across four interconnected operational portals.",
          "Dynamic B2B quotation engine supporting tiered pricing matrices, PDF generation, and pipeline-to-order conversion.",
          "Shared .NET 10 and Supabase service layer synchronizing storefront inventory with back-office fulfillment and CRM telemetry.",
        ],
        stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", ".NET 10"],
      },
      {
        id: "risse-ai-learning",
        buildLabel: "BUILD 02",
        title: "Risse AI Learning Platform",
        category: "EdTech & AI Tutoring",
        roleTags: ["Lead Engineer", "AI Systems"],
        description:
          "Gamified robotics curriculum featuring star-chart skill trees and dual Socratic/Competition Gemini AI tutoring modes.",
        highlights: [
          "Interactive constellation skill-tree graph tracking mastery prerequisites, XP progression, and hardware lab milestones.",
          "Dual-persona Gemini AI tutor switching seamlessly between guided Socratic questioning and time-boxed competition coaching.",
          "Real-time student telemetry and cohort dashboards engineered with React, Next.js App Router, and Supabase Realtime.",
        ],
        stack: ["Next.js", "React", "TypeScript", "Supabase", "Tailwind CSS"],
      },
    ],
  },
  {
    slug: "edge-ai",
    index: "02",
    title: "Edge AI & Computer Vision Pipelines",
    summary:
      "Low-latency audio/visual inference, multilingual NLP classification, and real-time behavioral threat detection.",
    primaryTags: ["YOLOv8/11", "Faster-Whisper", "TagalogBERT", "FastAPI"],
    stack: [
      "YOLOv8/11",
      "ByteTrack",
      "OpenCV",
      "Faster-Whisper (CUDA)",
      "TagalogBERT",
      "FastAPI",
    ],
    builds: [
      {
        id: "securelink-threat-engine",
        buildLabel: "BUILD 01",
        title: "SecureLink Threat Detection Engine",
        category: "Multimodal Edge Inference",
        roleTags: ["ML Engineer", "Backend"],
        description:
          "Real-time Tagalog/Taglish ASR + NLP sequence classification pipeline with automated danger-event snapshot capture.",
        highlights: [
          "CUDA-accelerated Faster-Whisper streaming transcription tuned for low-latency code-switched Tagalog and English speech.",
          "Fine-tuned TagalogBERT distress classifier evaluating sliding conversational windows to flag escalations under tight latency budgets.",
          "FastAPI event orchestrator triggering automated frame capture, incident metadata indexing, and instant responder alerts.",
        ],
        stack: ["Faster-Whisper (CUDA)", "TagalogBERT", "FastAPI", "OpenCV"],
      },
      {
        id: "pose-object-threat-recognizer",
        buildLabel: "BUILD 02",
        title: "Pose & Object Threat Recognizer",
        category: "Behavioral Computer Vision",
        roleTags: ["CV Engineer", "Pipeline Lead"],
        description:
          "Temporal behavior verification combining YOLO Pose keypoints and weapon detection with hardware serial triggers.",
        highlights: [
          "Dual-model YOLOv8/11 inference fusing skeletal keypoint kinematics with high-recall weapon bounding-box detection.",
          "ByteTrack multi-object persistence filtering transient false positives across consecutive temporal verification frames.",
          "Deterministic serial hardware bridge dispatching sub-second alert signals directly to external microcontrollers and relays.",
        ],
        stack: ["YOLOv8/11", "ByteTrack", "OpenCV", "FastAPI"],
      },
    ],
  },
  {
    slug: "embedded-iot",
    index: "03",
    title: "Embedded IoT & Hardware Prototyping",
    summary:
      "Power-constrained microcontroller firmware, custom PCB fabrication, and precision 3D-printed mechanical enclosures.",
    primaryTags: ["ESP32-S3", "FreeRTOS", "Fusion 360", "VEX V5"],
    stack: [
      "ESP32-S3",
      "FreeRTOS",
      "C/C++",
      "Fusion 360",
      "Proteus",
      "Bambu Lab P1S",
      "VEX V5",
    ],
    builds: [
      {
        id: "securelink-wearable-pin",
        buildLabel: "BUILD 01",
        title: "SecureLink Wearable Safety Pin",
        category: "Wearable Edge Hardware",
        roleTags: ["Firmware", "CAD & Enclosure"],
        description:
          "Underclocked 80MHz XIAO ESP32-S3 Sense hardware with I2S PDM audio, OV2640 camera, SpeexDSP VAD, BLE bridging, and a modular friction-fit Fusion 360 enclosure.",
        highlights: [
          "FreeRTOS task scheduling on an 80MHz-underclocked ESP32-S3 Sense balancing battery longevity against continuous audio capture.",
          "On-device SpeexDSP voice-activity detection gating I2S PDM audio streams and OV2640 burst frames over BLE bridging.",
          "Tool-less friction-fit wearable housing modeled in Fusion 360 and iterated with tight tolerances on a Bambu Lab P1S.",
        ],
        stack: [
          "ESP32-S3",
          "FreeRTOS",
          "C/C++",
          "Fusion 360",
          "Bambu Lab P1S",
        ],
      },
      {
        id: "vex-u-drivetrain",
        buildLabel: "BUILD 02",
        title: "VEX U Competition Drivetrain",
        category: "Competitive Robotics",
        roleTags: ["Mechanical", "Control Systems"],
        description:
          "Custom 8-motor chassis architecture, parametric 3D-printed gearing, and center-of-gravity optimization for national robotics competition.",
        highlights: [
          "Balanced 8-motor drive distribution engineered for rapid acceleration, defensive traction, and sustained thermal headroom.",
          "Parametric custom gearing and lightweight structural gussets validated in CAD and fabricated for match durability.",
          "Mass-distribution tuning lowering center of gravity across chassis rails to stabilize high-speed autonomous turns.",
        ],
        stack: ["VEX V5", "C/C++", "Fusion 360", "Bambu Lab P1S", "Proteus"],
      },
    ],
  },
  {
    slug: "realtime-3d",
    index: "04",
    title: "Real-Time 3D & Interactive Worlds",
    summary:
      "First-person combat mechanics, custom game engine tooling, and server-side gameplay architecture.",
    primaryTags: ["Unreal Engine 5.7", "C++", "Minecraft Fabric", "Java"],
    stack: [
      "Unreal Engine 5.7",
      "C++",
      "Blueprints",
      "Java",
      "Minecraft Fabric",
      "Skript",
    ],
    builds: [
      {
        id: "ue5-arena-wave-survival",
        buildLabel: "BUILD 01",
        title: "UE5 Arena Wave Survival Prototype",
        category: "Real-Time Combat Systems",
        roleTags: ["Gameplay Programmer", "UE5 C++"],
        description:
          "First-person combat system featuring bone-socket weapon hit traces and dynamic procedural mesh slicing.",
        highlights: [
          "Frame-accurate C++ bone-socket swept hit traces delivering responsive melee impact detection and hitstop feedback.",
          "Dynamic procedural mesh slicing bisecting enemy geometry along live blade-plane vectors on lethal strikes.",
          "Modular Blueprint and C++ wave director managing enemy spawn pacing, navmesh pathing, and combat state transitions.",
        ],
        stack: ["Unreal Engine 5.7", "C++", "Blueprints"],
      },
      {
        id: "cozymounts-rpg-systems",
        buildLabel: "BUILD 02",
        title: "CozyMounts & Custom RPG Systems",
        category: "Modding & Server Architecture",
        roleTags: ["Mod Author", "Server Architect"],
        description:
          "Fabric 26.2 mod engineering and custom server architecture with multi-wave arenas and custom item models.",
        highlights: [
          "Custom Java Fabric 26.2 entities, rideable mount physics, and synchronized client-server animation states.",
          "Multi-wave arena encounters orchestrated via event-driven Skript pipelines with progressive boss mechanics.",
          "Custom resource-pack item model pipelines seamlessly bound to server-side RPG progression and loot tables.",
        ],
        stack: ["Java", "Minecraft Fabric", "Skript"],
      },
    ],
  },
];

export function getDisciplineBySlug(slug: string | null): Discipline | null {
  if (!slug) return null;
  return DISCIPLINES.find((item) => item.slug === slug) ?? null;
}
