function _LoadAnimDict( dict )
	while ( not HasAnimDictLoaded( dict ) ) do 
		RequestAnimDict( dict )
		Citizen.Wait( 5 )
	end 
end 

function _LoadClipSet( set )
	while ( not HasClipSetLoaded( set ) ) do 
		RequestClipSet( set )
		Citizen.Wait( 5 )
	end 
end 


-- Used to show notifications on the screen.
function drawNotification(text)
	SetNotificationTextEntry("STRING")
	AddTextComponentString(text)
	DrawNotification(false, false)
end


-- String splits by the separator.
function stringsplit(inputstr, sep)
    if sep == nil then
            sep = "%s"
    end
    local t={} ; i=1
    for str in string.gmatch(inputstr, "([^"..sep.."]+)") do
            t[i] = str
            i = i + 1
    end
    return t
end

-- Sort a table by values.
function sortByValue(custTable)
  local Keys = {}

  for k,_ in pairs(custTable) do
    Keys[#Keys+1] = _
  end

  table.sort(Keys)
  
  local newObj = {}
  for k,v in ipairs(Keys) do
    for key,value in pairs(custTable) do
      if value == v then
        newObj[key] = value
        break
      end
    end
  end

  return newObj
end


-- Get Table Length
function getTableLength(T)
	local count = 0
	for _ in pairs(T) do 
		count = count + 1
	end
	return count
end


-- Get value for state toggles
function GetToggleState(variableName)
  local value = _G[variableName]

  if(value)then
    return "ON"
  else
    return "OFF"
  end
end


-- Request Input from the user
function requestInput(exampleText, maxLength)
	DisplayOnscreenKeyboard(1, "FMMC_KEY_TIP8", "", exampleText, "", "", "", maxLength + 1)
	blockinput = true

	while UpdateOnscreenKeyboard() ~= 1 and UpdateOnscreenKeyboard() ~= 2 do
		Wait(1)
	end

	local result = GetOnscreenKeyboardResult()
	blockinput = false

	if result then
		return result
	else
		return false
	end
end