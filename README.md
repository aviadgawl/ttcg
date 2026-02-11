# site
https://aviadgawl.github.io/ttcg/

# run locally & firestore emulator on
1) gcloud emulators firestore start --host-port=127.0.0.1:8080
2) npm run start:emu

# deploy new version
1) raise version number in App.tsx and in package.json
2) npm run build
3) git add & commit & push changes

# clear firestore emulator data
3) curl -v -X DELETE http://127.0.0.1:8080/emulator/v1/projects/ttcg-1170e/databases/(default)/documents

# create component
npx generate-react-cli component MyComponent

# bugs
Jump Step don't jump over obstacle

add test for one attached action each turn for a champion

need to move the action required validation to the attack event and not the attach event:
    if the champion don't have the bow gear he can not preform and attack that require a bow

# sprite config
Gruk High Knight

https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/#sex=male&body=Body_color_zombie_green&head=Orc_male_zombie_green&expression=Neutral_zombie_green&hat=Barbuta_ceramic&armour=Plate_ceramic&shoulders=Plate_ceramic&bracers=Bracers_ceramic&arms=Armour_ceramic&gloves=Gloves_ceramic&legs=Armour_ceramic&shoes=Armour_ceramic&weapon=Longsword_longsword&shield=Kite_kite%20gray%20gray

Gruk Barbarian

https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/#sex=male&body=Body_color_zombie_green&head=Orc_male_zombie_green&expression=Neutral_zombie_green&hat=Barbarian_nasal_ceramic&accessory=Short_Horns_ceramic&bauldron=Bauldron_brown&chainmail=Chainmail_gray&shoes=Armour_ceramic&weapon=Waraxe_waraxe

Robin archer

https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/#sex=male&body=Body_color_light&head=Human_male_light&expression=Neutral_light&hat=Leather_Cap_base&armour=Leather_leather&legs=Fur_Pants_base&weapon=Crossbow_crossbow&hair=Plain_chestnut&shoulders=Leather_leather&shoes=Basic_Shoes_brown

David battle priest

https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/#sex=male&body=Body_color_light&head=Human_male_light&expression=Neutral_light&beard=Winter_Beard_blonde&mustache=Big_Mustache_blonde&charm=Spider_amulet_brass_blue&weapon=Smash_hammer&chainmail=Chainmail_gray&cape=Solid_white&shoes=Basic_Shoes_white&shoulders=Epaulets_silver

David high priest

https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/#sex=male&body=Body_color_light&head=Human_male_light&expression=Neutral_light&beard=Winter_Beard_blonde&mustache=Big_Mustache_blonde&charm=Spider_amulet_brass_blue&cape=Solid_white&weapon=Loop_staff_silver&weapon_magic_crystal=Crystal_blue&legs=Formal_Pants_white&clothes=Longsleeve_white&shoes=Basic_Shoes_silver&hat=Nasal_helm_silver