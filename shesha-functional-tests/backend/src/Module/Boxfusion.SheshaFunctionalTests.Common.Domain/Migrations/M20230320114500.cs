﻿using FluentMigrator;
using System;
using Shesha.FluentMigrator;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230320114500)]
    public class M20230320114500 : AutoReversingMigration
    {
        public override void Up()
        {
            this.Shesha().SettingUpdate("Greeting")
                        .OnModule("Boxfusion.SheshaFunctionalTests.Common")
                        .SetValue("Hello world");

            this.Shesha().SettingUpdate("IsAllowedTo")
                        .OnModule("Boxfusion.SheshaFunctionalTests.Common")
                        .SetValue(true.ToString());
                 
        }
    }
}
