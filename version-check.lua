-- Credits to EssentialMode for this 
_VERSION = '0.4.0'

PerformHttpRequest( "https://thestonedturtle.github.io/version.txt", function( err, text, headers )
	Citizen.Wait( 1000 ) -- just to reduce clutter in the console on startup 
	RconPrint( "\nCurrent MelloTrainer Version: " .. _VERSION)
	RconPrint( "\nLatest MelloTrainer Version: " .. text)
	
	if ( text ~= _VERSION ) then
		RconPrint( "\n\n\t|||||||||||||||||||||||||||||||||\n\t||  MelloTrainer is Outdated   ||\n\t|| Download the latest version ||\n\t||    From the FiveM Forums    ||\n\t|||||||||||||||||||||||||||||||||\n\n" )
	else
		RconPrint( "\nMelloTrainer is up to date!\n" )
	end
end, "GET", "", { what = 'this' } )