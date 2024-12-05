﻿using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.NotificationMessage")]
    public class NotificationMessage : FullAuditedEntityWithExternalSync<Guid>, IMayHaveTenant
    {
        /// <summary>
        /// 
        /// </summary>
        public virtual Notification PartOf { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual NotificationChannelConfig Channel { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual string RecipientText { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual string Subject { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual string Message { get; set; }
        /// <summary>
        /// Number of attempt to send the message
        /// </summary>
        public virtual int RetryCount { get; set; }
        /// <summary>
        /// Direction (outgoing/incoming)
        /// </summary>
        [ReferenceList("Shesha.Core", "NotificationDirection")]
        public virtual RefListNotificationDirection? Direction { get; set; }
        /// <summary>
        /// 
        /// </summary>
        [ReferenceList("Shesha.Core", "NotificationReadStatus")]
        public virtual RefListNotificationReadStatus? ReadStatus { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual DateTime? FirstDateRead { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual DateTime? DateSent { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual string ErrorMessage { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual int? TenantId { get; set; }
        /// <summary>
        /// Status (outgoing/sent/failed etc)
        /// </summary>
        [ReferenceList("Shesha.Core", "NotificationStatus")]
        public virtual RefListNotificationStatus Status { get; set; }
    }
}
