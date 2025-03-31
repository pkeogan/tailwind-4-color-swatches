# tailwind-4-color-swatches
 Tool to generate Adobe AI Color swatches for Adobe AI

# Usage
1) Download `tailwind-4-colors.ase` from the repo
2) Open the `Swatches` Panel under `Window->Swatches`
3) In the bottom left open the "Swatches Library Menu"
![image](https://github.com/user-attachments/assets/a67eb536-a9f7-42e3-8428-ef0759cd24f4)

5) Click "Other Library"
![image](https://github.com/user-attachments/assets/955da759-7512-4e2b-9039-27f426fae68e)

7) Locate `tailwind-4-colors.ase`, select it, the click `open`
![image](https://github.com/user-attachments/assets/07c2cf69-bd37-4110-a117-7549824cd843)

9) Once loaded, click on the shift group hold `shift` then click on the last. Then open the options (top right) and click "Add To Swatches"
![adobe-ai-add-swatches_2](https://github.com/user-attachments/assets/a9430cd6-478c-4ff1-9342-d5837d261636)

11) All Done

# Build
1) pull the repo `git@github.com:pkeogan/tailwind-4-color-swatches.git`
2) install dependencies `npm install`
3) run `npm run generate`
4) this will output a `tailwind-4-colors.ase`

# Config
Colors are pulled from `tailwind-4-colors.json` which were pulled from tailwindcss 4 color config.
