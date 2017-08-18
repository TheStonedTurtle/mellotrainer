-- Credits to EssentialMode for this 
_VERSION = '0.4.0'

PerformHttpRequest( "http://www.afterliferp.co.uk/mt/version.txt", function( err, text, headers )
	RconPrint( "\nCurrent MelloTrainer Version: " .. _VERSION .. "" )
	RconPrint( "\nLatest MelloTrainer Version: " .. text .. "\n" )
	
	if ( text ~= _VERSION ) then
		RconPrint( "\nMelloTrainer is outdated, please download the latest version from the FiveM forum.\n" )
	else
		RconPrint( "\nMelloTrainer is up to date!\n" )
	end
end, "GET", "", { what = 'this' } )