DATASAVE = {}

DATASAVE.dir = "mtsaves/"
DATASAVE.players = {}

function DATASAVE:GetSteamId( source )
    local ids = GetPlayerIdentifiers( source )

    for k, v in pairs( ids ) do 
        local start = string.sub( v, 1, 5 )

        if ( start == "steam" ) then 
            return stringsplit( v, ":" )[2]
        end 
    end 

    return nil
end 

function DATASAVE:DoesSaveExist( steamid )
    local dir = self.dir .. steamid .. ".txt"
    local file = io.open( dir, "r" )

    if ( file ~= nil ) then 
        io.close()
        return true 
    else 
        return false 
    end 
end 

function DATASAVE:CreateSaveFile( steamid )
    local dir = self.dir .. steamid .. ".txt"

    local save, err = io.open( dir, 'w' )

    if ( not save ) then print( err ) end 

    -- save:write( "this is a test for " .. steamid )
    save:close()
end 

function DATASAVE:WriteToFile( steamid, data )
    local dir = self.dir .. steamid .. ".txt"

    local file, err = io.open( dir, 'a' ) 

    if ( not file ) then print( err ) end 

    file:write( tostring( data ) .. ";" )
    file:close()
end 

function DATASAVE:LoadSaveFile( steamid )
    local dir = self.dir .. steamid .. ".txt"

    local file, err = io.open( dir, 'r' )

    if ( not file ) then print( err ) return nil end 

    local contents = stringsplit( file, ";" )

    return contents 
end 

function DATASAVE:GetSteamIdFromSource( source )
    print( "DATASAVE:GetSteamIdFromSource - GOT " .. self.players[source] )

    if ( self.players[source] ) then 
        return self.players[source] 
    end 
end 

RegisterServerEvent( 'wk:AddPlayerToDataSave' )
AddEventHandler( 'wk:AddPlayerToDataSave', function()
    local steamId = DATASAVE:GetSteamId( source )
    
    if ( steamId ~= nil ) then 
        -- local newid = ( source & 0xFFFF ) + 1
        DATASAVE.players[source] = steamId
        print( "Setting " .. source .. " to " .. steamId )

        local exists = DATASAVE:DoesSaveExist( steamId )

        if ( exists ) then 
            RconPrint( "MELLOTRAINER: " .. GetPlayerName( source ) .. " has a save file.\n" )
        else 
            RconPrint( "MELLOTRAINER: " .. GetPlayerName( source ) .. " does not have a save file, creating one.\n" )
            DATASAVE:CreateSaveFile( steamId )
        end 
    else 
        RconPrint( "MELLOTRAINER: " .. GetPlayerName( source ) .. " is not connecting with a steam id.\nPlayer will not have the ability to save/load.\n" )
    end 
end )

RegisterServerEvent( 'wk:SendSaveData' )
AddEventHandler( 'wk:SendSaveData', function( source, data )

end )

AddEventHandler( 'playerDropped', function()
    if ( DATASAVE.players[source] ) then 
        print( "Cleared table slot for source " .. source )
        DATASAVE.players[source] = nil 
    end 
end )

RegisterServerEvent( 'wk:DataSave' )
AddEventHandler( 'wk:DataSave', function( data )
    print( "Got wk:DataSave from " .. GetPlayerName( source ) .. " " .. source  )
    print( "SteamID: " .. DATASAVE.players[source] )
    local id = DATASAVE:GetSteamIdFromSource( source ) 
    DATASAVE:WriteToFile( id, data )
end )

function startsWith( string, start )
    return string.sub( string, 1, string.len( start ) ) == start
end

function stringsplit( inputstr, sep )
    if sep == nil then
        sep = "%s"
    end

    local t = {} ; i = 1
    
    for str in string.gmatch( inputstr, "([^" .. sep .. "]+)" ) do
        t[i] = str
        i = i + 1
    end

    return t
end