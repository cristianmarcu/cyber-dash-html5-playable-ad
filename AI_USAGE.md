# AI Usage

This document describes how AI tools were used during the Cyber Dash playable ad project.

AI was used as a development support tool, not as a replacement for project ownership. I used it mainly to move faster through visual exploration, technical validation, production checks and documentation cleanup, while the final gameplay, implementation, testing and delivery decisions remained my responsibility.

## Summary

Cyber Dash was built as a mobile-first HTML5 playable ad using PixiJS, TypeScript and Vite.

AI support was useful in these areas:

- Exploring visual directions for a Cyber Dash playable ad
- Iterating on character poses and screen asset ideas
- Checking practical HTML5 ad constraints
- Validating mobile-first playable ad structure
- Reasoning through lane perspective and object alignment
- Supporting production validation
- Polishing documentation language

All implementation decisions, gameplay changes, testing and final production validation were completed by me.

## Visual Exploration

AI was used during the visual exploration phase to quickly test different art directions for the runner, intro screen and end-card style. This helped speed up asset iteration before integrating selected assets into the PixiJS runtime.

Examples of AI-assisted tasks:

```txt
Create a mobile portrait Cyber Dash playable ad intro screen for a futuristic 3-lane runner
The design should feel premium, readable on mobile and suitable for an HTML5 mobile ad
Leave clear space for a coded PixiJS start button
Avoid real brand logos and copyrighted characters
```

```txt
Generate a stylized Cyber Dash runner character viewed from behind
The character should read clearly as a small mobile game sprite
Use a clean silhouette, futuristic suit details and transparent background
```

```txt
Create an additional running contact frame for the same Cyber Dash character
The foot should touch the ground while the pose still feels in motion
Keep the proportions and visual style consistent with the existing runner frames
```

## Playable Ad Planning

AI was used to review the structure of a small HTML5 playable ad. The goal was to keep the runtime focused, mobile-friendly and easy to review.

Representative prompt:

```txt
I am building a small mobile-first PixiJS playable ad with TypeScript and Vite
React should only mount and unmount the PixiJS canvas
PixiJS should handle gameplay screens, sprites, ticker updates, input, HUD and cleanup
Suggest a practical structure for a 3-lane runner with intro, gameplay, collectibles, obstacles, key pickup, end card and retry flow
```

## Gameplay Math Checks

AI was used for quick reasoning around the lane perspective system. The important part was making sure the player, symbols, key, obstacles and track markers all followed one consistent 3-lane transform.

Representative prompt:

```txt
I have a 390 by 844 mobile PixiJS runner with three lanes
Objects move from the distance toward the player
Help me reason through a simple perspective lane formula so the player, collectibles, obstacles and lane markers stay aligned
The result should stay simple and reliable for a small playable ad
```

## Production Validation

AI was used to help prepare validation steps for the final static build. The checks were performed manually using local preview, Chrome DevTools, Incognito mode and the hosted `/cyber-dash/` version.

Validation areas:

- Relative runtime asset loading
- Local-only asset delivery
- First-load request count
- Production build size
- Mobile portrait viewport behavior
- Gameplay flow from intro to end card
- Retry flow
- CTA event behavior

Representative prompt:

```txt
I need to validate a static PixiJS playable ad before sharing it
The production build should stay under 5 MB and under 100 first-load requests
Help me prepare a practical QA checklist covering build output, hosted deployment, browser Network checks, mobile viewport testing and the full gameplay flow
```

## Documentation Support

AI was occasionally used to improve documentation readability and consistency after the implementation was complete.

Representative prompt:

```txt
Help me make the README for this PixiJS playable ad clearer and more professional
It should explain the live demo, gameplay, controls, tech stack, source organization, build commands and production checks
Keep the tone concise and suitable for a technical review
```

## Work Handled Directly

I handled the core project work and final decisions, including:

- Defining the playable ad concept and gameplay loop
- Setting the final mobile portrait direction
- Integrating the PixiJS gameplay flow
- Testing lane movement, collisions, key pickup, retry flow and success end card
- Checking production build size and request count
- Deploying and validating the hosted `/cyber-dash/` version
- Reviewing the final source organization and documentation
- Preparing the project for GitHub and external review

## Final Note

AI was used to accelerate repetitive tasks, explore visual ideas and validate technical decisions during development.

The final project reflects the implemented gameplay, technical decisions, testing and deployment work carried out throughout the project.
