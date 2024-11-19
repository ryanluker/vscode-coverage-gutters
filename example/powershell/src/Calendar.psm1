using namespace System.Collections
using namespace System.Collections.Generic
using module '.\Appointment.psm1'

<#
  .SYNOPSIS
    Returns a new Calendar object with the given name

  .PARAMETER Name
    Name / ID of the Calendar

  .NOTES
    throws a ArgumentNullException if the given Name is null or an empty string
#>
function Get-Calendar
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)][String] $Name
    )

    if ([String]::IsNullOrWhiteSpace($Name))
    {
        throw [System.ArgumentNullException]::new('Name can not be null or empty string')
    }
    return [Calendar]::new($Name, $env:username)
}

class Calendar
{
    [String] $Name
    [String] $Owner
    [List[Appointment]] $Appointments

    Calendar([String] $Name, [String] $Owner)
    {
        $this.Name = $Name
        $this.Owner = $Owner
        $this.Appointments = New-Object List[Appointment]
    }

    [void] AddAppointment([Appointment] $Appointment)
    {
        $this.Appointments.Add($Appointment)
    }

    [void] AddAppointment([String] $Title, [DateTime] $StartTime, [DateTime] $EndTime)
    {
        $appointment = [Appointment]::new($Title, $StartTime, $EndTime)
        $this.Appointments.Add($appointment)
    }
}