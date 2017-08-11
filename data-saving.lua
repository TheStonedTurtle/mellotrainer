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

function DATASAVE:DoesFileExist( name )
    local dir = self.dir .. name
    local file = io.open( dir, "r" )

    if ( file ~= nil ) then 
        io.close()
        return true 
    else 
        return false 
    end 
end 

function DATASAVE:CreateFile( name )
    local dir = self.dir .. name

    local file = io.open( dir, 'w' )

    if ( not file ) then RconPrint( err ) end

    file:close()
end 

function DATASAVE:LoadFile( name )
    local dir = self.dir .. name 

    local file, err = io.open( dir, 'r' )

    if ( not file ) then RconPrint( err ) return nil end 

    file:close()

    local contents = stringsplit( file, ";" )

    return contents 
end 

function DATASAVE:WriteToFile( name, data )
    local dir = self.dir .. name

    local file, err = io.open( dir, 'a' ) 

    if ( not file ) then RconPrint( err ) end 

    file:write( tostring( data ) .. ";" )
    file:close()
end 

function DATASAVE:SendSaveData( source )
    local id = DATASAVE:GetSteamIdFromSource( source )

    if ( id ~= nil ) then 
        local data = DATASAVE:LoadSaveFile( source )
    else 
        RconPrint( "MELLOTRAINER: Attempted to load save data for " .. GetPlayerName( source ) .. ", but does not have a steam id." ) 
    end 
end 

function DATASAVE:GetSteamIdFromSource( source )
    RconPrint( "DATASAVE:GetSteamIdFromSource - GOT " .. self.players[source] )

    if ( self.players[source] ) then 
        return self.players[source] 
    else 
        return nil 
    end 
end 

RegisterServerEvent( 'wk:AddPlayerToDataSave' )
AddEventHandler( 'wk:AddPlayerToDataSave', function()
    local steamId = DATASAVE:GetSteamId( source )
    
    if ( steamId ~= nil ) then 
        -- local newid = ( source & 0xFFFF ) + 1
        DATASAVE.players[source] = steamId
        RconPrint( "Setting " .. source .. " to " .. steamId )

        local exists = DATASAVE:DoesSaveExist( steamId )

        if ( exists ) then 
            RconPrint( "MELLOTRAINER: " .. GetPlayerName( source ) .. " has a save file.\n" )
            TriggerEvent( 'wk:SendSaveData' )
        else 
            RconPrint( "MELLOTRAINER: " .. GetPlayerName( source ) .. " does not have a save file, creating one.\n" )
            DATASAVE:CreateSaveFile( steamId )
        end 
    else 
        DATASAVE.players[source] = nil 
        RconPrint( "MELLOTRAINER: " .. GetPlayerName( source ) .. " is not connecting with a steam id.\nPlayer will not have the ability to save/load.\n" )
    end 
end )

RegisterServerEvent( 'wk:DataSave' )
AddEventHandler( 'wk:DataSave', function( type, data )
    RconPrint( "Got wk:DataSave from " .. GetPlayerName( source ) .. " " .. source  )
    RconPrint( "SteamID: " .. DATASAVE.players[source] )
    local id = DATASAVE:GetSteamIdFromSource( source ) 

    if ( id ~= nil ) then 
        DATASAVE:WriteToFile( id, data )
    else 
        RconPrint( "MELLOTRAINER: " .. GetPlayerName( source ) .. " attempted to save, but does not have a steam id." ) 
    end 
end )

AddEventHandler( 'playerDropped', function()
    if ( DATASAVE.players[source] ) then 
        RconPrint( "Cleared table slot for source " .. source )
        DATASAVE.players[source] = nil 
    end 
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