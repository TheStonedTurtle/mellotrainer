 // Request JSON from File
 var MelloTrainerJSON = {}

 // HTML Callback Quick References
 var requestNames = {
    // *
    // * Skin Categories
    // *
    "player_skins_characters" : MelloTrainerJSON["Skins"]["Player List"],
    "player_skins_animals" : MelloTrainerJSON["Skins"]["Animal List"],
    "player_skins_npcs" : MelloTrainerJSON["Skins"]["NPC List"],

    // *
    // * Vehicle Categories
    // *
    "vehicle_cars_supercars" : MelloTrainerJSON["Vehicles"]["Supercars"],
    "vehicle_cars_sports" : MelloTrainerJSON["Vehicles"]["Sports"],
    "vehicle_cars_sportsclassics" : MelloTrainerJSON["Vehicles"]["Sports Classics"],
    "vehicle_cars_muscle" : MelloTrainerJSON["Vehicles"]["Muscle"],
    "vehicle_cars_lowriders" : MelloTrainerJSON["Vehicles"]["Lowriders"],
    "vehicle_cars_coupes" : MelloTrainerJSON["Vehicles"]["Coupes"],
    "vehicle_cars_sedans" : MelloTrainerJSON["Vehicles"]["Sedans"],
    "vehicle_cars_compacts" : MelloTrainerJSON["Vehicles"]["Compacts"],
    "vehicle_cars_suvs" : MelloTrainerJSON["Vehicles"]["SUVs"],
    "vehicle_cars_offroad" : MelloTrainerJSON["Vehicles"]["Offroad"],
    "vehicle_cars_vip" : MelloTrainerJSON["Vehicles"]["VIP"],
    "vehicle_industrial_pickups" : MelloTrainerJSON["Vehicles"]["Pickups"],
    "vehicle_industrial_vans" : MelloTrainerJSON["Vehicles"]["Vans"],
    "vehicle_industrial_trucks" : MelloTrainerJSON["Vehicles"]["Trucks"],
    "vehicle_industrial_service" : MelloTrainerJSON["Vehicles"]["Service"],
    "vehicle_industrial_trailers" : MelloTrainerJSON["Vehicles"]["Trailers"],
    "vehicle_industrial_trains" : MelloTrainerJSON["Vehicles"]["Trains"],
    "vehicle_emergency" : MelloTrainerJSON["Vehicles"]["Emergency"],
    "vehicle_motorcycles" : MelloTrainerJSON["Vehicles"]["Motorcycles"],
    "vehicle_planes" : MelloTrainerJSON["Vehicles"]["Planes"],
    "vehicle_helicopters" : MelloTrainerJSON["Vehicles"]["Helicopters"],
    "vehicle_boats" : MelloTrainerJSON["Vehicles"]["Boats"],
    "vehicle_bicycles" : MelloTrainerJSON["Vehicles"]["Bicycles"],

    // *
    // * Weapon Categories
    // *
    "weapon_melee" : MelloTrainerJSON["Weapons"]["Melee"],
    "weapon_handguns" : MelloTrainerJSON["Weapons"]["Handguns"],
    "weapon_submachine" : MelloTrainerJSON["Weapons"]["Submachine"],
    "weapon_assault" : MelloTrainerJSON["Weapons"]["Assault"],
    "weapon_shotgun" : MelloTrainerJSON["Weapons"]["Shotguns"],
    "weapon_snipers" : MelloTrainerJSON["Weapons"]["Snipers"],
    "weapon_heavy" : MelloTrainerJSON["Weapons"]["Heavy"],
    "weapon_thrown" : MelloTrainerJSON["Weapons"]["Thrown"],

    // *
    // * Vehicle Paint Options
    // *
    "vehicle_mod_paint_primary_normal": MelloTrainerJSON["Vehicle Paints"]["Primary Classic"],
    "vehicle_mod_paint_secondary_normal": MelloTrainerJSON["Vehicle Paints"]["Secondary Classic"],
    "vehicle_mod_paint_primary_metal": MelloTrainerJSON["Vehicle Paints"]["Primary Metal"],
    "vehicle_mod_paint_secondary_metal": MelloTrainerJSON["Vehicle Paints"]["Secondary Metal"],
    "vehicle_mod_paint_primary_matte": MelloTrainerJSON["Vehicle Paints"]["Primary Matte"],
    "vehicle_mod_paint_secondary_matte": MelloTrainerJSON["Vehicle Paints"]["Secondary Matte"],
    "vehicle_mod_paint_primary_metallic": MelloTrainerJSON["Vehicle Paints"]["Primary Metallic"],
    "vehicle_mod_paint_secondary_metallic": MelloTrainerJSON["Vehicle Paints"]["Secondary Metallic"],
    "vehicle_mod_paint_primary_chrome": MelloTrainerJSON["Vehicle Paints"]["Primary Chrome"],
    "vehicle_mod_paint_secondary_chrome": MelloTrainerJSON["Vehicle Paints"]["Secondary Chrome"],
    "vehicle_mod_paint_wheels":  MelloTrainerJSON["Vehicle Paints"]["Wheels"],
    // Own Category?
    "vehicle_mod_paint_pearl_topcoat": MelloTrainerJSON["Vehicle Paints"]["Primary Classic"],
    // Better Way to populate both? Maybe even better way to Primary/Secondary.
    "vehicle_mod_paint_both_normal" : MelloTrainerJSON["Vehicle Paints"]["Primary Classic"],
    "vehicle_mod_paint_both_metal": MelloTrainerJSON["Vehicle Paints"]["Primary Metal"],
    "vehicle_mod_paint_both_matte": MelloTrainerJSON["Vehicle Paints"]["Primary Matte"],
    "vehicle_mod_paint_both_metallic": MelloTrainerJSON["Vehicle Paints"]["Primary Metallic"],
    "vehicle_mod_paint_both_chrome": MelloTrainerJSON["Vehicle Paints"]["Primary Chrome"],

    // *
    // * Vehicle Neon/Smoke Color Options
    // *
    "vehicle_mod_neon_colors": MelloTrainerJSON["Vehicle RGBs"]["Neon Colors"],
    "vehicle_mod_smoke_colors": MelloTrainerJSON["Vehicle RGBs"]["Smoke Colors"],

    // *
    // * Vehicle Modification Options
    // *
    "vehicle_mod_horn" : MelloTrainerJSON["Vehicle Mods"]["Horns"],
    "vehicle_wheel_0": MelloTrainerJSON["Vehicle Mods"]["Wheels Sport"],
    "vehicle_wheel_1": MelloTrainerJSON["Vehicle Mods"]["Wheels Muscle"],
    "vehicle_wheel_2": MelloTrainerJSON["Vehicle Mods"]["Wheels Lowrider"],
    "vehicle_wheel_3": MelloTrainerJSON["Vehicle Mods"]["Wheels SUV"],
    "vehicle_wheel_4": MelloTrainerJSON["Vehicle Mods"]["Wheels Offroad"],
    "vehicle_wheel_5": MelloTrainerJSON["Vehicle Mods"]["Wheels Tuner"],
    "vehicle_wheel_7": MelloTrainerJSON["Vehicle Mods"]["Wheels Highend"],
    "vehicle_wheel_8": MelloTrainerJSON["Vehicle Mods"]["Wheels Benny"],
    "vehicle_wheel_front": MelloTrainerJSON["Vehicle Mods"]["Wheels Front"],
    "vehicle_wheel_back": MelloTrainerJSON["Vehicle Mods"]["Wheels Back"]
 }
