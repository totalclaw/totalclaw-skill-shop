module.exports = {
  skillId: 'totalclaw:totalclaw~sqlservr-sql-server-toolkit',
  descriptionZh: 'Microsoft SQL Server 命令行工具包，涵盖架构、迁移、索引、诊断与备份。',
  bodyZh: `# SQL Server 工具包

Microsoft SQL Server 命令行工具包。

## 能力
- 架构创建
- 版本化迁移
- 索引管理
- 性能诊断
- 备份与恢复
- 批量导入/导出

## 连接
sqlcmd -S localhost -E
sqlcmd -S localhost -U sa -P YourPassword

## 运行脚本
sqlcmd -S localhost -d MyDatabase -i script.sql

## 示例表
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME()
);

## 示例索引
CREATE INDEX IX_Users_Email ON Users(Email);

## 备份示例
BACKUP DATABASE MyDatabase
TO DISK = 'C:\\backup\\MyDatabase.bak'
WITH FORMAT, INIT;

## 性能诊断
SET STATISTICS IO ON;
SET STATISTICS TIME ON;`,
};
