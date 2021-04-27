using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Wellcome.MoH.Repository.SqlServer.Core
{
    public interface IMoHReport
    {
        [Key]
        int ShortBNumber { get; set; }

        DateTime ReportDate { get; set; }
        int Year { get; set; }
        string YearString { get; set; }
        string Place { get; set; }  // this is still the planman data place, which we probably won't use in production
        int? OsGazetteer { get; set; }

        // additions for production
        string MarcTitle { get; set; }
        string NormalisedPlace { get; set; }
        string FullText { get; set; }
        int? PageCount { get; set; }
        int? TableCount { get; set; }
        string Author { get; set; }
        ICollection<PlaceMapping> PlaceMappings { get; set; }
        Guid? CoverImageId { get; set; }
// ReSharper disable InconsistentNaming
        string Marc110aPlace { get; set; }
// ReSharper restore InconsistentNaming
        string HarvestFolder { get; set; }
        int? PlanmanOffset { get; set; }
        int? PlanmanAltoCount { get; set; }
        string NormalisedMoHPlace { get; set; }
        int? PublicationYear { get; set; }
    }

    public class MoHReport : IEquatable<MoHReport>, IMoHReport
    {
        [Key]
        public int ShortBNumber { get; set; }
        public string CollectionName { get; set; }
        public DateTime ReportDate { get; set; }
        public int Year { get; set; }
        public string YearString { get; set; }
        public string Place { get; set; }
        public int? OsGazetteer { get; set; }
        //public int? MatchType { get; set; }
        //public string SimplePlaceName { get; set; }

        // additions for production
        public string MarcTitle { get; set; }
        public string NormalisedPlace { get; set; }
        public string FullText { get; set; }
        public int? PageCount { get; set; }
        public int? TableCount { get; set; }
        public string Author { get; set; }
        public virtual ICollection<PlaceMapping> PlaceMappings { get; set; }
        public Guid? CoverImageId { get; set; }
        public string Marc110aPlace { get; set; }
        public string HarvestFolder { get; set; }
        public int? PlanmanOffset { get; set; }
        public int? PlanmanAltoCount { get; set; }
        public int? FullTextLength { get; set; }
        public string NormalisedMoHPlace { get; set; }
        public int? PublicationYear { get; set; }

        public override string ToString()
        {
            return String.Format("[MoH {0}: {1} | {2}]", ShortBNumber, Place, YearString);
        }


        public bool Equals(MoHReport other)
        {
            if (ReferenceEquals(null, other)) return false;
            if (ReferenceEquals(this, other)) return true;
            return ShortBNumber == other.ShortBNumber && string.Equals(CollectionName, other.CollectionName) && ReportDate.Equals(other.ReportDate) && Year == other.Year && string.Equals(YearString, other.YearString) && string.Equals(Place, other.Place);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return Equals((MoHReport) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                int hashCode = ShortBNumber;
                hashCode = (hashCode*397) ^ (CollectionName != null ? CollectionName.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ ReportDate.GetHashCode();
                hashCode = (hashCode*397) ^ Year;
                hashCode = (hashCode*397) ^ (YearString != null ? YearString.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ (Place != null ? Place.GetHashCode() : 0);
                return hashCode;
            }
        }
    }
}