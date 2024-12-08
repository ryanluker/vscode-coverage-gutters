Describe 'Get-Calendar Cmdlet' {
    BeforeAll {
        Import-Module "$PSScriptRoot\..\src\Calendar.psm1"
    }

    It 'returns a calender object' {
        $calendar = Get-Calendar -Name 'Private'
        $calendar.GetType() | Should -BeExactly 'Calendar'
    }
}

Describe 'Get-Appointment Cmdlet' {
    BeforeAll {
        Import-Module "$PSScriptRoot\..\src\Appointment.psm1"
    }

    It 'creates an appointment' {
        $appointment = New-Appointment -Title 'Daily Meeting'
        $appointment.Title | Should -BeExactly 'Daily Meeting'
    }

    It 'checks if appointment is in the past' {
        $appointment = New-Appointment -Title 'Daily Meeting'
        $appointment.IsPastAppointment() | Should -Be $false
    }
}