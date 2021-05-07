using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace Wellcome.MoH.Repository.SqlServer
{
    public static class SqlServerContextExtensions
    {    
        public static List<T> MapRawSql<T>(this DatabaseFacade database,
            string query, 
            List<SqlParameter> sqlParams, 
            Func<DbDataReader, T> map,
            int timeout = -1)
        {
            using var sqlConnection = (SqlConnection) database.GetDbConnection();
            using var command = sqlConnection.CreateCommand();
            command.CommandText = query;
            command.CommandType = CommandType.Text;
            command.Parameters.AddRange(sqlParams.ToArray());
            if (timeout > 0)
            {
                command.CommandTimeout = timeout;
            }

            database.OpenConnection();

            using var result = command.ExecuteReader();
            var entities = new List<T>();
            while (result.Read())
            {
                entities.Add(map(result));
            }
            return entities;
        }
    }
}