﻿using System;
using Shesha.AutoMapper;
using Shesha.Roles.Dto;

namespace Shesha.Permissions.Dtos
{
    public class PermissionMapProfile : ShaProfile
    {
        public PermissionMapProfile()
        {
            CreateMap<Abp.Authorization.Permission, PermissionDto>()
                .ForMember(e => e.ParentName, c => c.MapFrom(e => 
                    e.Parent != null ? e.Parent.Name : null))
                .ForMember(e => e.DisplayName, c => c.MapFrom(e =>
                    Localize(e.DisplayName)))
                .ForMember(e => e.Id, c => c.MapFrom(e => e.Name))
                .ForMember(e => e.IsDbPermission, c => c.MapFrom(e =>
                    e.Properties != null && e.Properties.ContainsKey("IsDbPermission") && (bool)e.Properties["IsDbPermission"]
                    ))
                .ForMember(e => e.ModuleId, c => c.MapFrom(e =>
                    e.Properties != null && e.Properties.ContainsKey("ModuleId") ? (Guid?)e.Properties["ModuleId"] : null
                    ))
                ;
        }
    }
}
