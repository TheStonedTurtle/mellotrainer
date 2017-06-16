-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.




RegisterNUICallback("player", function(data, cb)
	local playerPed = GetPlayerPed(-1)
	local action = data.action
	local newstate = data.newstate

	local text = "~r~OFF"
	if(newstate) then
		text = "~g~ON"
	end


	-- Heal Player
	if action == "heal" then
		SetEntityHealth(playerPed, 200)
		ClearPedBloodDamage(playerPed)
		ClearPedWetness(playerPed)

		if(featureKeepWet)then -- Keep Wet Check.
			SetPedWetnessHeight(playerPed, 2.0)
		end
		drawNotification("~g~Cleaned & Healed.")

	-- Body Armor
	elseif action == "armor" then
		SetPedArmour(playerPed, 100)
		drawNotification("~g~Armor Added.")

	-- Suicide 
	elseif action == "suicide" then
		SetEntityHealth(playerPed, 0)
		drawNotification("~r~You Committed Suicide.")

	-- God Mode/Invincibility
	elseif action == "god" then
		featurePlayerInvincible = newstate
		drawNotification("God Mode: "..tostring(text))

		featurePlayerInvincibleUpdated = true;

	-- Infinite Stamina
	elseif action == "stamina" then
		featurePlayerInfiniteStamina = newstate
		drawNotification("Unlimited Stamina: "..tostring(text))

	-- Drunk Mode
	elseif action == "drunk" then
		featurePlayerDrunk = newstate
		drawNotification("Drunk Mode: "..tostring(text))

		featurePlayerDrunkUpdated = true;


	-- Invsibility Toggle
	elseif action == "invisible" then
		featurePlayerInvisible = newstate
		drawNotification("Invisibility: "..tostring(text))

		featurePlayerInvisibleUpdated = true;


	-- Silent Mode
	elseif action == "silent" then
		featurePlayerNoNoise = newstate
		drawNotification("Silent Mode: "..tostring(text))

		featurePlayerNoNoiseUpdated = true;


	-- Everyone Ignores you
	elseif action == "everyone" then
		featurePlayerIgnoredByAll = newstate
		drawNotification("Everyone Ignores You: "..tostring(text))

		featurePlayerIgnoredByAllUpdated = true;


	-- Police Ignore You
	elseif action == "police" then
		featurePlayerIgnoredByPolice = newstate
		drawNotification("Police Ingore You: "..tostring(text))

		featurePlayerIgnoredByPoliceUpdated = true;


	-- Never Wanted
	elseif action == "wanted" then
		featurePlayerNeverWanted = newstate
		drawNotification("Never Wanted: "..tostring(text))

		featurePlayerNeverWantedUpdated = true;

	elseif action == "keepwet" then
		featureKeepWet = newstate
		featureKeepWetUpdated = true;

	elseif action == "fastswim" then
		fastSwimEnabled = newstate
		fastSwimEnabledUpdated = true;

	elseif action == "fastrun" then
		fastRunEnabled = newstate
		fastRunEnabledUpdated = true;

	elseif action == "superjump" then
		featureSuperJumpEnabled = newstate

	elseif action == "noragdoll" then
		featureNoRagdoll = newstate
		featureNoRagdollUpdated = true;

	elseif action == "nightvision" then
		featureNightVision = newstate
		featureNightVisionUpdated = true;

	elseif action == "thermalvision" then
		featureThermalVision = newstate
		featureThermalVisionUpdated = true;

	elseif action == "radiooff" then
		featureRadioAlwaysOff = newstate
		featureRadioAlwaysOffUpdated = true;


	end

	cb("ok")
end)



Citizen.CreateThread(function()


	while true do
		Wait(1)

		local playerPed = GetPlayerPed(-1)
		local playerID = PlayerId()
		if playerPed then


			-- Keep Wet
			if(featureKeepWet and featureKeepWetUpdated) then
				SetPedWetnessHeight(playerPed, 2.0)
				featureKeepWetUpdated = false;
			end


			-- Silent (NOT WORKING?)
			if(featurePlayerNoNoiseUpdated)then
				if(featurePlayerNoNoise)then
					SetPlayerNoiseMultiplier(playerID, 0.0)
				else
					SetPlayerNoiseMultiplier(playerID, 1.0)
				end
				featurePlayerNoNoiseUpdated = false
			end


			-- Fast Swim
			if(fastSwimEnabledUpdated)then
				if(fastSwimEnabled)then
					SetSwimMultiplierForPlayer(playerID, 1.49)
				else
					SetSwimMultiplierForPlayer(playerID, 1.0)
				end
				fastSwimEnabledUpdated = false
			end


			-- Fast Run
			if(fastRunEnabledUpdated)then
				if(fastRunEnabled)then
					SetRunSprintMultiplierForPlayer(playerID, 1.49)
				else
					SetRunSprintMultiplierForPlayer(playerID, 1.0)
				end
				fastRunEnabledUpdated = false
			end


			-- Super Jump
			if (featureSuperJumpEnabled)then
				SetSuperJumpThisFrame(playerID)
			end


			-- No Ragdoll
			if (featureNoRagdollUpdated)then
				SetPedCanRagdoll(playerPed, featureNoRagdoll)

				featureNoRagdollUpdated = false;
			end


			-- Night Vision
			if(featureNightVisionUpdated)then
				SetNightvision(featureNightVision)

				featureNightVisionUpdated = false
			end


			-- Thermal Vision
			if (featureThermalVisionUpdated)then
				SetSeethrough(featureThermalVision)

				featureThermalVisionUpdated = false
			end


			-- Radio Off
			if (featureRadioAlwaysOffUpdated)then
				if(IsPedInAnyVehicle(playerPed, false))then
					SetVehicleRadioEnabled(GetVehiclePedIsUsing(playerPed), not featureRadioAlwaysOff)
				end
				SetUserRadioControlEnabled(not featureRadioAlwaysOff)
			end


			-- Godmode
			if(featurePlayerInvincibleUpdated) then
				SetEntityInvincible(playerPed, featurePlayerInvincible)
				featurePlayerInvincibleUpdated = false;
			end


			-- Stamina
			if featurePlayerInfiniteStamina then
				RestorePlayerStamina(playerID, 1.0)
			end


			-- Drunk
			if(featurePlayerDrunkUpdated) then
				SetPedIsDrunk(playerPed, drunk)
				if(featurePlayerDrunk) then
					RequestClipSet("move_m@drunk@verydrunk")

					while (HasClipSetLoaded("move_m@drunk@verydrunk") == false) do
						Wait(1)
					end

					Citizen.Trace("Drunk Movement")
					SetPedMovementClipset(playerPed, "move_m@drunk@verydrunk", 0.0)
				else
					ResetPedMovementClipset(playerPed, 0.0)
					RemoveClipSet("move_m@drunk@verydrunk")
				end
				featurePlayerDrunkUpdated = false;
			end


			-- Invisibility
			if(featurePlayerInvisibleUpdated)then
				if featurePlayerInvisible then
					SetEntityVisible(playerPed, false, 0)
				else
					SetEntityVisible(playerPed, true, 0)
				end
				featurePlayerInvisibleUpdated = false;
			end



			-- Everyone Ignores Me
			SetEveryoneIgnorePlayer(PlayerID, featurePlayerIgnoredByAll)
			if(featurePlayerIgnoredByAll) then
				SuppressShockingEventsNextFrame()
			end


			-- Police Ignore Me & Don't Dispatch
			SetPoliceIgnorePlayer(PlayerID, featurePlayerIgnoredByPolice)
			if(featurePlayerIgnoredByPolice) then
				SetDispatchCopsForPlayer(playerID, false)
			else
				SetDispatchCopsForPlayer(playerID, true)
			end


			-- Never Wanted & clears wanted level.
			if(featurePlayerNeverWanted) then
				if(GetPlayerWantedLevel(PlayerID) > 0) then
					ClearPlayerWantedLevel(PlayerID)
				end
				SetMaxWantedLevel(0)
			else
				SetMaxWantedLevel(5)
			end

		end
	end
end)