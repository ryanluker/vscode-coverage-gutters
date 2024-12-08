<#
.SYNOPSIS
    Returns a new Appointment object with the given title

.PARAMETER Title
    Title of the Appointment
#>
function New-Appointment
{
    [CmdletBinding()]
    param(
        [String] $Title
    )
    return [Appointment]::new($Title)
}

class Appointment
{
    [String] $Title
    [DateTime] $StartTime
    [DateTime] $EndTime

    Appointment([String] $Title)
    {
        $this.Title = $Title
        $this.StartTime = [DateTime]::Now
        $this.EndTime = $this.StartTime.AddHours(1)
    }

    Appointment([String] $Title, [DateTime] $StartTime)
    {
        $this.Title = $Title
        $this.StartTime = $StartTime
        $this.EndTime = $this.StartTime.AddHours(1)
    }

    Appointment([String] $Title, [DateTime] $StartTime, [DateTime] $EndTime)
    {
        $this.Title = $Title
        $this.StartTime = $StartTime
        $this.EndTime = $this.StartTime.AddHours(1)
    }

    Appointment([String] $Title, [DateTime] $StartTime, [Int32] $Duration)
    {
        $this.Title = $Title
        $this.StartTime = $StartTime
        $this.EndTime = $this.StartTime.AddHours($Duration)
    }

    [Boolean] IsPastAppointment()
    {
        return $this.EndTime -lt [DateTime]::Now
    }
}