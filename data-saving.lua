os.execute( "mkdir mtsaves" )

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
        io.close( file )
        return true 
    else 
        return false 
    end 
end 

function DATASAVE:CreateFile( name )
    local dir = self.dir .. name

    local file, err = io.open( dir, 'w' )

    if ( not file ) then RconPrint( err ) end

    file:write( "{}" ) 
    file:close()
end 

function DATASAVE:LoadFile( name )
    local dir = self.dir .. name 

    local file, err = io.open( dir, 'rb' )

    if ( not file ) then RconPrint( err ) return nil end 

    local contents = file:read( "*all" )

    contents = json.decode( contents )

    file:close()

    return contents 
end 

function DATASAVE:WriteToFile( name, data, index )
    local dir = self.dir .. name

    local fileTable = self:LoadFile( name ) 

    if ( not fileTable ) then return end 

    if ( data == nil ) then 
        table.remove( fileTable, index ) -- table.remove reindexes all values after removing 
    else 
        fileTable[index] = data
    end 

    local fileString = json.encode( fileTable )

    local file, err = io.open( dir, 'w+' )

    if ( not file ) then RconPrint( err ) return end 

    file:write( fileString )
    file:close()
end 

function DATASAVE:SendSaveData( source )
    local id = DATASAVE:GetSteamIdFromSource( source )

    if ( id ~= nil ) then 
        local vehicleData = {}
        local skinData = {}

        local vehFileName = id .. "_vehicles.txt"
        local skinFileName = id .. "_skins.txt"

        vehicleData = DATASAVE:LoadFile( vehFileName )
        skinData = DATASAVE:LoadFile( skinFileName )

        if ( next( vehicleData ) ~= nil ) then 
            TriggerClientEvent( 'wk:RecieveSavedVehicles', source, vehicleData )
        end 
    else 
        RconPrint( "MELLOTRAINER: Attempted to load save data for " .. GetPlayerName( source ) .. ", but does not have a steam id.\n" ) 
    end 
end 

function DATASAVE:GetSteamIdFromSource( source )
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
        DATASAVE.players[source] = steamId

        local vehFileName = steamId .. "_vehicles.txt"
        local skinFileName = steamId .. "_skins.txt"

        RconPrint( "Setting " .. source .. " to " .. steamId .. "\n" )

        local exists = DATASAVE:DoesFileExist( vehFileName ) and DATASAVE:DoesFileExist( skinFileName )

        if ( exists ) then 
            RconPrint( "MELLOTRAINER: " .. GetPlayerName( source ) .. " has a save file.\n" )
            DATASAVE:SendSaveData( source )
        else 
            RconPrint( "MELLOTRAINER: " .. GetPlayerName( source ) .. " does not have a save file, creating one.\n" )

            DATASAVE:CreateFile( vehFileName )
            DATASAVE:CreateFile( skinFileName )
        end 
    else 
        DATASAVE.players[source] = nil 
        RconPrint( "MELLOTRAINER: " .. GetPlayerName( source ) .. " is not connecting with a steam id.\nPlayer will not have the ability to save/load.\n" )
    end 
end )

RegisterServerEvent( 'wk:DataSave' )
AddEventHandler( 'wk:DataSave', function( type, data, index )
    RconPrint( "Got wk:DataSave from " .. GetPlayerName( source ) .. " " .. source .. "\n"  )
    RconPrint( "SteamID: " .. DATASAVE.players[source] .. "\n" )
    local id = DATASAVE:GetSteamIdFromSource( source ) 

    if ( id ~= nil ) then 
        local file = id .. "_" .. type .. ".txt"
        DATASAVE:WriteToFile( file, data, index )
    else 
        RconPrint( "MELLOTRAINER: " .. GetPlayerName( source ) .. " attempted to save, but does not have a steam id.\n" ) 
    end 
end )

AddEventHandler( 'playerDropped', function()
    if ( DATASAVE.players[source] ) then 
        RconPrint( "Cleared table slot for source " .. source .. "\n" )
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