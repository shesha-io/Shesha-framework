﻿using System;
using System.Collections.Generic;
using Abp.Notifications;
using Newtonsoft.Json;
using Shesha.Domain.Enums;
using Shesha.EntityReferences;

namespace Shesha.Notifications.Dto
{
    /// <summary>
    /// Is used to store template based notification data
    /// </summary>
    [Serializable]
    public class ShaNotificationData : NotificationData 
    {
        /// <summary>
        /// Template Id
        /// </summary>
        public Guid? TemplateId { get; set; }

        /// <summary>
        /// Attachments
        /// </summary>
        public List<NotificationAttachmentDto> Attachments { get; set; } = new List<NotificationAttachmentDto>();

        /// <summary>
        /// Send type (email/sms/push etc)
        /// </summary>
        public virtual RefListNotificationType SendType { get; set; }

        /// <summary>
        /// Recipient text (email address/mobile number etc)
        /// </summary>
        public virtual string RecipientText { get; set; }
        /// <summary>
        /// Recipient text (email address/mobile number etc)
        /// </summary>
        public virtual string SourceEntityId { get; internal set; }

        public virtual string SourceEntityClassName { get; internal set; }

        public virtual string SourceEntityDisplayName { get; internal set; }

        public virtual string Cc { get; set; }
        public virtual Guid? RecipientId { get; set; }

        protected string Data {
            get => Properties[nameof(Data)] as string;
            set => Properties[nameof(Data)] = value;
        }

        protected string DataTypeName
        {
            get => Properties[nameof(DataTypeName)] as string;
            set => Properties[nameof(DataTypeName)] = value;
        }

        public void SetSourceEntity(GenericEntityReference sourceEntity = null)
        {
            if (sourceEntity != null)
            {
                SourceEntityId = sourceEntity.Id;
                SourceEntityClassName = sourceEntity._className;
                SourceEntityDisplayName = sourceEntity._displayName;
            }
            else
            {
                SourceEntityId = null;
                SourceEntityClassName = null;
                SourceEntityDisplayName = null;
            }
        }

        public NotificationData GetData()
        {
            if (string.IsNullOrWhiteSpace(Data) || string.IsNullOrWhiteSpace(DataTypeName))
                return null;

            var type = System.Type.GetType(DataTypeName);

            return type != null
                ? JsonConvert.DeserializeObject(Data, type) as NotificationData
                : null;
        }

        public void SetData(NotificationData data)
        {
            Data = JsonConvert.SerializeObject(data);
            DataTypeName = data.GetType().AssemblyQualifiedName;
        }

        /// <summary>
        /// Default constructor. Note: important for deserialization
        /// </summary>
        public ShaNotificationData()
        {
            
        }

        public ShaNotificationData(NotificationData data)
        {
            SetData(data);
        }
    }
}
