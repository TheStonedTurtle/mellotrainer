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
		valid[i] = { value=i, textureCount=textureCount }
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
			valid[i] = { value=i, textureCount=textureCount }
		end
	end

	return valid
end



-- Convert the tables We create to a JSON string to be converted by trainer.js
local function createJSONString(myTable)
	local JSONString = "{"
	local count = 0

	-- Loop over each Skin Feature.
	for k,v in pairs(myTable) do
		-- print(k,v)


		local customString = '"'..tostring(k)..'":['

		if count > 0 then
			customString = ","..customString 
		end

		JSONString = JSONString..customString

		-- Loop through each drawable for the skin feature
		local subcount = 0
		for key,value in pairs(v) do
			-- Loop over the textures for each drawable (should always have at least 1)
			local subString = '{"id": "'..tostring(value.value)..'", "textureCount": "'..tostring(value.textureCount)..'"}'


			if subcount > 0 then
				subString = ","..subString
			end
			JSONString = JSONString..subString
			subcount = subcount + 1
		end
		JSONString = JSONString.."]"	
		count = count + 1
	end


	JSONString = JSONString.."}"

	return JSONString
end




-- Skin DB
local components = {
	{ name = 'Face', t = 0},
	{ name = 'Beard', t = 1},
	{ name = 'Hair/Hats', t = 2},
	{ name = 'Shirts', t = 3},
	{ name = 'Top', t = 11},
	{ name = 'Pants', t = 4},
	{ name = 'Hands', t = 5},
	{ name = 'Shoes', t = 6},
	{ name = 'Eyes', t = 7},
	{ name = 'Accessories', t = 8},
	{ name = 'Accessories2', t = 9},
	{ name = 'Decals/Masks', t = 10}
}


-- Prop DB
local propComponents = {
	{ name = "Headware", t = 0},
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
	RequestModel(model)
	while not HasModelLoaded(model) do
		Wait(1)
	end

	SetPlayerModel(PlayerId(), model)
	SetPedDefaultComponentVariation(GetPlayerPed(-1))
	drawNotification("~g~Changed Player Model.")
	resetOptions("playerskinmodify playerpropmodify")
	cb("ok")
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

		local SkinJSON = createJSONString(validOptions)
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
		local PropJSON = createJSONString(validOptions)
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

	cb("ok")
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

	cb("ok")
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

	cb("ok")
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


	cb("ok")
end)