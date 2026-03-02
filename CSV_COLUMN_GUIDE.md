# CSV Column Guide for Sustainability Reporting

This guide explains the recommended columns for your sustainability CSV upload to get the best analysis results following **GRI (Global Reporting Initiative)** standards.

## 📋 Column Requirements

### ✅ **Required Columns**

At minimum, your CSV should have:

```csv
Year,Total_GHG_Emissions,Energy_Consumption,Water_Usage,Waste_Generated
2020,9850,45000,125000,850
2021,9880,44000,120000,820
```

- **Year** - Reporting period (e.g., 2020, 2021, 2022)
- At least **2-3 environmental metrics** (emissions, energy, water, or waste)

### 🌟 **Recommended Columns (GRI-Aligned)**

For comprehensive GRI compliance analysis, include these columns:

#### **GRI 305: Emissions**

```
GHG_Emissions_Scope1        # Direct emissions from owned sources (tCO2e)
GHG_Emissions_Scope2        # Indirect emissions from purchased energy (tCO2e)
GHG_Emissions_Scope3        # Other indirect emissions (tCO2e)
Total_GHG_Emissions         # Sum of all scopes (tCO2e)
Emissions_Intensity         # Emissions per revenue unit (tCO2e/$M)
NOx_Emissions               # Nitrogen oxides (metric tons)
SOx_Emissions               # Sulfur oxides (metric tons)
Particulate_Matter          # PM emissions (metric tons)
VOC_Emissions               # Volatile organic compounds (metric tons)
```

#### **GRI 302: Energy**

```
Energy_Consumption          # Total energy consumed (MWh or GJ)
Renewable_Energy            # Renewable energy usage (MWh or GJ)
Renewable_Energy_Percent    # Percentage of renewable energy (%)
Energy_Intensity            # Energy per revenue unit (MWh/$M)
Renewable_Energy_Investment # Investment in renewable projects ($)
```

#### **GRI 303: Water**

```
Water_Withdrawal            # Total water withdrawn (cubic meters)
Water_Consumption           # Water consumed/not returned (cubic meters)
Water_Discharge             # Water returned to source (cubic meters)
Water_Recycled              # Water recycled/reused (cubic meters)
Water_Intensity             # Water per revenue unit (m³/$M)
Water_Usage                 # General water usage metric (cubic meters)
```

#### **GRI 306: Waste**

```
Waste_Generated             # Total waste produced (metric tons)
Waste_Recycled              # Waste diverted to recycling (metric tons)
Waste_Landfill              # Waste sent to landfill (metric tons)
Hazardous_Waste             # Hazardous waste handled (metric tons)
Waste_Diversion_Rate        # % of waste diverted from landfill
```

#### **GRI 403: Occupational Health & Safety**

```
Safety_Incidents            # Total safety incidents
Lost_Time_Injury_Rate       # LTIR per 200,000 hours worked
```

#### **GRI 404: Training & Education**

```
Training_Hours_Total        # Total training hours provided
Training_Hours_Per_Employee # Average hours per employee
```

#### **GRI 405: Diversity & Equal Opportunity**

```
Women_Employees_Percent     # Percentage of women employees (%)
```

#### **GRI 401: Employment**

```
Employee_Count              # Number of employees
Employee_Turnover_Rate      # Annual turnover rate (%)
```

#### **GRI 307: Environmental Compliance**

```
Environmental_Fines         # Total fines paid ($)
Compliance_Violations       # Number of violations
```

#### **Supporting Metrics**

```
Revenue_Million             # Revenue in millions ($M)
Production_Volume           # Units produced or processed
Facilities_Count            # Number of operating facilities
Sustainability_Investment   # Total sustainability investments ($)
```

## 📊 Sample CSV Structure

### **Minimum Example**

```csv
Year,GHG_Emissions,Energy_Consumption,Water_Usage,Waste_Generated
2020,9850,45000,125000,850
2021,9880,44000,120000,820
2022,9900,42000,115000,800
2023,9850,40000,110000,780
2024,9780,38000,105000,750
```

### **Comprehensive Example** (See `sample-sustainability-report.csv`)

```csv
Year,GHG_Emissions_Scope1,GHG_Emissions_Scope2,GHG_Emissions_Scope3,Total_GHG_Emissions,Energy_Consumption,Renewable_Energy,Renewable_Energy_Percent,Water_Withdrawal,Water_Consumption,Water_Recycled,Waste_Generated,Waste_Recycled,Waste_Diversion_Rate,NOx_Emissions,Employee_Count,Training_Hours_Per_Employee,Women_Employees_Percent,Safety_Incidents,Environmental_Fines,Sustainability_Investment,Revenue_Million
2020,1250,3400,5200,9850,45000,5000,11.1,125000,100000,15000,850,450,52.9,45,1000,25,32,15,50000,500000,10000
2021,1180,3200,5500,9880,44000,7500,17.0,120000,95000,18000,820,480,58.5,42,1050,27,35,12,25000,750000,10500
2022,1100,3000,5800,9900,42000,10000,23.8,115000,90000,22000,800,520,65.0,38,1100,29,38,10,0,1000000,11100
```

## 📐 Data Format Guidelines

### ✓ **DO**

- Use numeric values only (no units in cells)
- Use column headers with underscores (not spaces)
- Include at least 3-5 years of data for trend analysis
- Keep consistent units across all years
- Use comma (`,`) as delimiter
- Include header row as first line

### ✗ **DON'T**

- Don't include units in data cells (e.g., "9850 tCO2e" ❌, use "9850" ✓)
- Don't use spaces in column names (use underscores)
- Don't mix measurement systems
- Don't leave empty cells (use 0 if no data)
- Don't include special characters or currency symbols in numbers

## 🎯 GRI Standard Mapping

| Column Prefix                                     | GRI Standard      | Description                    |
| ------------------------------------------------- | ----------------- | ------------------------------ |
| `GHG_*`, `Emissions_*`, `NOx_*`, `SOx_*`, `VOC_*` | **GRI 305**       | Greenhouse gas & air emissions |
| `Energy_*`, `Renewable_*`                         | **GRI 302**       | Energy consumption             |
| `Water_*`                                         | **GRI 303**       | Water and effluents            |
| `Waste_*`                                         | **GRI 306**       | Waste management               |
| `Safety_*`, `Lost_Time_*`                         | **GRI 403**       | Occupational health & safety   |
| `Training_*`                                      | **GRI 404**       | Training and education         |
| `Women_*`, `Employee_Turnover_*`                  | **GRI 405 / 401** | Diversity & employment         |
| `Environmental_Fines`, `Compliance_*`             | **GRI 307**       | Environmental compliance       |

## 💡 Tips for Better Analysis

1. **More columns = Better compliance score** - Include Scope 1/2/3 breakdowns
2. **Intensity metrics matter** - Add emissions/energy per revenue or employee
3. **Multi-year data** - 3+ years shows trends and improvement trajectories
4. **Complete data coverage** - Fill all cells (use 0 if metric not applicable)
5. **Consistent naming** - Match the column names above for automatic recognition

## 📥 Units Reference

| Metric        | Recommended Unit         | Alternative Units   |
| ------------- | ------------------------ | ------------------- |
| GHG Emissions | metric tons CO2e (tCO2e) | kg CO2e             |
| Energy        | Megawatt-hours (MWh)     | Gigajoules (GJ)     |
| Water         | Cubic meters (m³)        | Liters, Gallons     |
| Waste         | Metric tons              | Kilograms           |
| Revenue       | Millions USD             | Thousands, Billions |

## 🚀 Quick Start

1. Download the sample: `public/sample-sustainability-report.csv`
2. Replace with your company's data
3. Keep the same column headers
4. Upload to get instant GRI compliance analysis!

---

**Need help?** The AI agent will work with any CSV structure, but following this guide ensures optimal GRI compliance scoring and more accurate recommendations.
