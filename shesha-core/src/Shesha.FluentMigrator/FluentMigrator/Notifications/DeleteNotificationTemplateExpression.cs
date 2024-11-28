﻿using FluentMigrator;
using FluentMigrator.Expressions;

namespace Shesha.FluentMigrator.Notifications
{
    /// <summary>
    /// NotificationTemplate delete expression
    /// </summary>
    public class DeleteNotificationTemplateExpression : SheshaMigrationExpressionBase
    {
        public string? Name { get; set; }
        public string? Namespace { get; set; }
        public bool DeleteAll { get; set; }
        public Guid? TemplateId { get; set; }

        public override void ExecuteWith(IMigrationProcessor processor)
        {
            var exp = new PerformDBOperationExpression()
            {
                Operation = (connection, transaction) =>
                {
                    var helper = new NotificationDbHelper(DbmsType, connection, transaction, QuerySchema);

                    if (TemplateId.HasValue)
                    {
                        helper.DeleteNotificationTemplate(TemplateId.Value);
                    }
                    else if (DeleteAll)
                    {
                        if (string.IsNullOrWhiteSpace(Namespace) || string.IsNullOrWhiteSpace(Name))
                            throw new ArgumentException($"DeleteNotificationTemplateExpression: '{nameof(Namespace)}' and '{nameof(Name)}' are mandatory");

                        var templateId = helper.GetNotificationId(Namespace, Name);
                        if (templateId == null)
                            throw new Exception($"Reference list '{Namespace}.{Name}' not found");

                        // delete all if filter is not specified
                        helper.DeleteNotificationTemplates(Namespace, Name);
                    } else
                        throw new NotSupportedException();
                }
            };
            processor.Process(exp);
        }

        public DeleteNotificationTemplateExpression(DbmsType dbmsType, IQuerySchema querySchema) : base(dbmsType, querySchema)
        {
            
        }
    }
}
