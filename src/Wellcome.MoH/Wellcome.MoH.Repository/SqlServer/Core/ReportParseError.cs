using System;

namespace Wellcome.MoH.Repository.SqlServer.Core
{

    public class ReportParseError
    {
        public int Id { get; set; }
        public int ShortBNumber { get; set; }
        public string BNumber { get; set; }
        public string FilePath { get; set; }
        public string DirectoryPath { get; set; }
        public long TableId { get; set; }
        public string Message { get; set; }
        public string StackTrace { get; set; }
        public DateTime? Recorded { get; set; }

        
        public static void Record(MoHContext ctx, int shortBNumber, string bNumber, string directoryPath,
            string filePath,
            string errorMessage, string stackTrace, long tableId)
        {
            var err = ctx.ReportParseErrors.Create();
            err.ShortBNumber = shortBNumber;
            err.BNumber = bNumber;
            err.DirectoryPath = directoryPath;
            err.FilePath = filePath;
            err.Message = errorMessage;
            err.StackTrace = stackTrace;
            err.TableId = tableId;
            err.Recorded = DateTime.Now;
            //if (stackTrace != null)
            //{
            //    err.StackTrace = String.Join("\r\n", stackTrace);
            //}
            ctx.ReportParseErrors.Add(err);
            ctx.SaveChanges();
        }

        public static void Record(int shortBNumber, string bNumber, string directoryPath, string filePath,
            string errorMessage, string stackTrace, long tableId)
        {
            using (var ctx = new MoHContext())
            {
                Record(ctx, shortBNumber, bNumber, directoryPath, filePath, errorMessage, stackTrace, tableId);
            }
        }
    }
}