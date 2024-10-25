﻿using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Core", "PreferredContactMethod")]
    public enum RefListPreferredContactMethod : int
    {
        Email = 1,
        SMS = 2,
        Push = 3
    }
}
