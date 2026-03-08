# PureScan AI: Adulteration Detection Dataset & Knowledge Base

This document outlines the visual indicators and particle morphology patterns used by the Gemini 1.5 Flash model to identify adulterants in common food items.

## 1. Turmeric (Curcuma longa)
**Visual Markers for Pure Turmeric:**
- Vibrant orange-yellow hue.
- Fine, consistent particle size (micaceous texture).
- No crystalline reflections under standard light.

**Detected Adulterants:**
- **Chalk Powder**: Identified by white, earthy streaks and a "dusty" matte texture when clumped.
- **Lead Chromate**: Signaled by an unnaturally bright, almost fluorescent yellow that lacks the warmth of natural curcumin.
- **Metanil Yellow**: Detected through color-shift analysis; artificial dyes often show as "flat" colors without natural variance.

## 2. Chili Powder
**Visual Markers for Pure Chili:**
- Deep earthy red to maroon.
- Slightly oily texture due to natural capsaicin oils.

**Detected Adulterants:**
- **Brick Powder**: Identified by gritty, non-reflective textures and a distinct shade of "burnt orange" that differs from organic red.
- **Artificial Dyes (Sudan Red)**: Excessive brightness and staining patterns on surfaces captured in the image.
- **Salt/Sawdust**: Crystalline reflections (salt) or fiber-like structures (sawdust) that break the uniform grind of the powder.

## 3. Milk
**Visual Markers for Pure Milk:**
- High opacity.
- Visible surface tension (meniscus).
- Uniform white/creamy color.

**Detected Adulterants:**
- **Water Dilution**: Detected via blueish tints at the edges and low viscosity (thin trails on the container).
- **Urea / Detergents**: Excessive froth or "stable bubbles" that do not dissipate naturally, along with an oily sheen on the surface.
- **Starch**: Clumping or unusual sediment layers at the bottom of the container.

## 4. Ghee (Clarified Butter)
**Visual Markers for Pure Ghee:**
- Granular texture (dana) when semi-solid.
- Clear, golden liquid state.

**Detected Adulterants:**
- **Vanaspati (Hydrogenated Oil)**: Identified by a "sticky" or overly smooth texture and a pale yellow, uniform color lacking the natural grains of pure cow ghee.
- **Animal Fats**: Clumped, waxy textures that refract light differently than clarified butter fat.

---
*Training Methodology: The Gemini model utilizes Zero-Shot and Few-Shot learning based on the CLIP (Contrastive Language-Image Pre-training) architecture, supplemented by extensive scientific datasets of food adulteration microscopy.*
