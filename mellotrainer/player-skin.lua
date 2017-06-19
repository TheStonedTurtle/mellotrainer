-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.


-- Reset certain non-static menus.
function resetOptions(message)
	SendNUIMessage({
		resetmenus = message
	})
end


-- Get all valid skin variations for the current skin.
function checkValidComponents(componentID, componentName)
	local playerPed = GetPlayerPed(-1)
	local valid = {}
	local pedCount = GetNumberOfPedDrawableVariations(playerPed, componentID)
	for i = 1, pedCount, 1 do
		--if IsPedComponentVariationValid(playerPed, componentID, i, -1) then
		local textureCount = GetNumberOfPedTextureVariations(playerPed, componentID, i - 1)
		valid[i] = { id=i, textureCount=textureCount }
		--end
	end
	return valid
end


-- Get all Valid Prop components for the current skin
function checkValidPropComponents(propID)
	local playerPed = GetPlayerPed(-1)
	local valid = {}
	local propCount = GetNumberOfPedPropDrawableVariations(playerPed, propID)
	for i = 1, propCount, 1 do
		local textureCount = GetNumberOfPedPropTextureVariations(playerPed, propID, i - 1)
		if textureCount > 0 then
			valid[i] = { id=i, textureCount=textureCount }
		end
	end

	return valid
end



-- Skin DB
local components = {
	{ name = 'Head/Face', t = 0},
	{ name = 'Beard/Mask', t = 1},
	{ name = 'Hair/Hats', t = 2},
	{ name = 'Top/Shirts', t = 3},
	{ name = 'Legs/Pants', t = 4},
	{ name = 'Gloves/Hands', t = 5},
	{ name = 'Shoes/Feet', t = 6},
	{ name = 'Neck/Eyes', t = 7},
	{ name = 'Accessories-Top', t = 8},
	{ name = 'Accessories-Extra', t = 9},
	{ name = 'Badges/Decals', t = 10},
	{ name = 'Shirt/Jacket', t = 11}
}


-- Prop DB
local propComponents = {
	{ name = "Hats/Mask/Helmets", t = 0},
	{ name = "Glasses", t = 1},
	{ name = "Ears/Accessories", t = 2}
}


-- Error message
local modifyEmpty = "~r~Nothing to modify!"



-- Change players skin.
RegisterNUICallback("playerskin", function(data, cb)
	local model
	if data.action == "input" then
		model = GetHashKey(requestInput("", 60))
	else
		model = GetHashKey(data.action)
	end
	if(not(IsModelValid(model)))then
		drawNotification("~r~Invalid Model Name")
		return
	end
	
	RequestModel(model)
	while not HasModelLoaded(model) do
		Wait(1)
	end

	SetPlayerModel(PlayerId(), model)
	SetPedDefaultComponentVariation(GetPlayerPed(-1))
	drawNotification("~g~Changed Player Model.")
	resetOptions("playerskinmodify playerpropmodify")

	if(cb)then cb("ok")end
end)



-- Return all player skin variations in JSON format.
RegisterNUICallback("playerskinmodify", function(data, cb)
	local validOptions = {}
	local optCount = 0

	for i=1,#components,1 do
		local validComponents = checkValidComponents(components[i].t)

		if #validComponents > 0 then

			validOptions[components[i].name] = validComponents

			--Citizen.Trace("Component: "..tostring(components[i].name).." has "..tostring(#validComponents).." valid components.")

			for t=1,#validComponents,1 do
				--Citizen.Trace("Drawable Value: "..tostring(validComponents[t].value).." has "..tostring(validComponents[t].textureCount).." textures.")
			end
			optCount = optCount + 1
		end
	end

	if (optCount > 0) then
		local SkinJSON = json.encode(validOptions, {indent = true})

		Citizen.Trace(SkinJSON);

		SendNUIMessage({
			createmenu = true,
			name = "skinmenu",
			menuName = "playerskinmodify",
			menudata = SkinJSON
		})
	else
		drawNotification(modifyEmpty)
	end
end)


-- Return all player prop components in JSON format.
RegisterNUICallback("playerpropmodify", function(data, cb)
	local validOptions = {}
	local optCount = 0

	for i=1,#propComponents,1 do
		local validComponents = checkValidPropComponents(propComponents[i].t)

		if #validComponents > 0 then
			validOptions[propComponents[i].name] = validComponents
			optCount = optCount + 1
		end
	end

	if (optCount > 0) then
		local PropJSON = json.encode(validOptions, {indent = true})

		Citizen.Trace(PropJSON);

		SendNUIMessage({
			createmenu = true,
			name = "propmenu",
			menuName = "playerpropmodify",
			menudata = PropJSON
		})	
	else
		drawNotification(modifyEmpty)
	end
end)


-- Default Skin/Clear Props for current skin.
RegisterNUICallback("defaultskin", function(data, cb)
	local playerPed = GetPlayerPed(-1)
	if(data.action == "skin") then
		SetPedDefaultComponentVariation(playerPed)
	end

	if(data.action == "props") then
		ClearAllPedProps(playerPed)
	end

	if(cb)then cb("ok")end
end)


-- Remove Individual Props from the current skin.
RegisterNUICallback("clearpropid", function(data, cb)
	local componentText = tostring(data.action)
	local componentID
	for i,v in ipairs(propComponents) do
		if(v.name == componentText) then
			componentID = v.t
		end
	end

	ClearPedProp(GetPlayerPed(-1), componentID)

	if(cb)then cb("ok")end
end)



-- Random skin/prop variations for the current skin.
RegisterNUICallback("randomskin", function(data, cb)
	local playerPed = GetPlayerPed(-1)
	if(data.action == "skin") then
		SetPedRandomComponentVariation(playerPed)
	end

	if(data.action == "props") then
		SetPedRandomProps(playerPed)
	end

	if(cb)then cb("ok")end
end)



-- Changes the current component to the requested variation (Skin/Props)
RegisterNUICallback("changeskin", function(data, cb)
	local playerPed = GetPlayerPed(-1)
	local componentText = tostring(data.data[3])
	local drawableID = tonumber(data.data[4]) - 1
	local textureID = tonumber(data.data[5])
	if(textureID == nil)then
		textureID = 0
	end


	local componentID

	if(data.action == "skin") then
		for i,v in ipairs(components) do
			if(v.name == componentText) then
				componentID = v.t
			end
		end
		SetPedComponentVariation(playerPed, componentID, drawableID, textureID)

	elseif(data.action == "props") then
		for i,v in ipairs(propComponents) do
			if(v.name == componentText) then
				componentID = v.t
			end
		end

		SetPedPropIndex(playerPed, componentID, drawableID, textureID, true)
	end
	Citizen.Trace("ComponentID: "..tostring(componentID)..", Drawable ID:"..tostring(drawableID)..", Texture ID:"..tostring(textureID))


	if(cb)then cb("ok")end
end)