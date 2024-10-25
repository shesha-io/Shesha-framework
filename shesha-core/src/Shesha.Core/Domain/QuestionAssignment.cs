﻿using Abp.Domain.Entities.Auditing;
using Shesha.Authorization.Users;
using Shesha.Domain.Attributes;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.QuestionAssignment", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class QuestionAssignment: FullAuditedEntity<Guid>
    {
        /// <summary>
        /// 
        /// </summary>
        public virtual User User { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public virtual SecurityQuestion SelectedQuestion { get; set; }

        /// <summary>
        /// 
        /// </summary>
        [StringLength(500)]
        public virtual string Answer { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public virtual int? TenantId { get; set; }

    }
}
