﻿using Shesha.Domain.Attributes;
using System.ComponentModel;

namespace Shesha.Authorization
{
    [ReferenceList("ShaLoginResultType")]
    public enum ShaLoginResultType : int
    {
        Success = 1,
        
        [Description("Invalid username or email")]
        InvalidUserNameOrEmailAddress = 2,

        [Description("Invalid password")]
        InvalidPassword = 3,

        [Description("User is not active")]
        UserIsNotActive = 4,
        
        [Description("Invalid tenant name")]
        InvalidTenancyName = 5,

        [Description("Tenant is not active")]
        TenantIsNotActive = 6,

        [Description("User email is not confirmed")]
        UserEmailIsNotConfirmed = 7,

        [Description("Unknown external login")]
        UnknownExternalLogin = 8,

        [Description("Locked out")]
        LockedOut = 9,

        [Description("User phone number is not confirmed")]
        UserPhoneNumberIsNotConfirmed = 10,

        [Description("Device not registered")]
        DeviceNotRegistered = 11,

        [Description("Invalid username")]
        InvalidUserName = 12,

        [Description("User not found")]
        UserNotFound = 13,

        [Description("Invalid OTP")]
        InvalidOTP = 14,

        [Description("Forbidden Frontend")]
        ForbiddenFrontend = 15,
    }
}
