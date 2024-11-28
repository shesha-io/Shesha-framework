﻿using FluentMigrator;
using FluentMigrator.Expressions;

namespace Shesha.FluentMigrator.ReferenceLists
{
    /// <summary>
    /// ReferenceListItem create expression
    /// </summary>
    public class AddReferenceListItemExpression : SheshaMigrationExpressionBase
    {
        public AddReferenceListItemExpression(DbmsType dbmsType, IQuerySchema querySchema, string @namespace, string name, ReferenceListItemDefinition item) : base(dbmsType, querySchema)
        {
            Namespace = @namespace;
            Name = name;
            Item = item;
        }

        public string Name { get; set; }
        public string Namespace { get; set; }
        public ReferenceListItemDefinition Item { get; set; }

        public override void ExecuteWith(IMigrationProcessor processor)
        {
            var exp = new PerformDBOperationExpression() { Operation = (connection, transaction) => 
                {
                    var helper = new ReferenceListDbHelper(DbmsType, connection, transaction, QuerySchema);
                    
                    var refListId = helper.GetReferenceListId(Namespace, Name);
                    if (refListId == null)
                        throw new Exception($"Reference list '{Namespace}.{Name}' not found");
                    helper.InsertReferenceListItem(refListId.Value, Item);
                } 
            };
            processor.Process(exp);
        }

    }
}
