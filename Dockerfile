FROM mcr.microsoft.com/dotnet/sdk:5.0.102-ca-patch-buster-slim-amd64 AS build
WORKDIR /src

# copy csproj files and restore packages
COPY src/Wellcome.MoH/Wellcome.MoH.Api/Wellcome.MoH.Api.csproj Wellcome.MoH.Api/
COPY src/Wellcome.MoH/Wellcome.MoH.Repository/Wellcome.MoH.Repository.csproj Wellcome.MoH.Repository/
COPY src/Wellcome.MoH/Wellcome.MoH.Web/Wellcome.MoH.Web.csproj Wellcome.MoH.Web/

RUN dotnet restore "Wellcome.MoH.Web/Wellcome.MoH.Web.csproj"

# Copy everything else
COPY src/Wellcome.MoH/ ./

# build
WORKDIR "/src/Wellcome.MoH.Web"
RUN dotnet build "Wellcome.MoH.Web.csproj" -c Release

# publish
FROM build AS publish
WORKDIR "/src/Wellcome.MoH.Web"
RUN dotnet publish "Wellcome.MoH.Web.csproj" --no-build -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:5.0-buster-slim
WORKDIR /app

EXPOSE 80
COPY --from=publish /app/publish .
ENTRYPOINT [ "dotnet", "Wellcome.MoH.Web.dll" ]