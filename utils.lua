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