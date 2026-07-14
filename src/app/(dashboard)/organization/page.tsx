"use client";

import React from "react";
import {
  Building,
  Users,
  MapPin,
  ChevronDown,
  Layers,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  StatCard,
  SectionCard,
} from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OrgNode {
  name: string;
  role: string;
  designation: string;
  department: string;
  photoURL?: string;
  children?: OrgNode[];
}

export default function OrganizationPage() {
  const departments = [
    { name: "Engineering", lead: "System Admin", count: 120, color: "bg-emerald-500" },
    { name: "Human Resources", lead: "HR Manager", count: 8, color: "bg-blue-500" },
    { name: "Product Management", lead: "Project Manager", count: 15, color: "bg-purple-500" },
    { name: "Finance & Accounts", lead: "Finance Lead", count: 5, color: "bg-amber-500" },
  ];

  // Org Chart Data Structure
  const orgTree: OrgNode = {
    name: "System Admin",
    role: "admin",
    designation: "Chief Executive Officer (CEO)",
    department: "Executive Board",
    photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    children: [
      {
        name: "HR Manager",
        role: "hr",
        designation: "VP of Human Resources",
        department: "Human Resources",
        photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
        children: [
          {
            name: "Priya Nair",
            role: "employee",
            designation: "HR Specialist",
            department: "Human Resources",
            photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
          }
        ]
      },
      {
        name: "Project Manager",
        role: "manager",
        designation: "VP of Engineering & Product",
        department: "Product Management",
        photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
        children: [
          {
            name: "Ananya Krishnan",
            role: "employee",
            designation: "Lead Software Engineer",
            department: "Engineering",
            photoURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
          },
          {
            name: "Rahul Sharma",
            role: "employee",
            designation: "Product Designer",
            department: "Product",
            photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
          }
        ]
      }
    ]
  };

  const renderMemberCard = (node: OrgNode) => {
    const initials = node.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <div className="flex flex-col items-center bg-card border border-border/85 rounded-xl p-3.5 shadow-xs w-[190px] relative transition-all hover:shadow-sm">
        <Avatar className="size-11 border border-border/80">
          <AvatarImage src={node.photoURL} alt={node.name} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="text-center mt-2.5 min-w-0 w-full">
          <h4 className="text-xs font-bold text-foreground truncate" title={node.name}>
            {node.name}
          </h4>
          <p className="text-[10px] text-muted-foreground truncate font-medium mt-0.5" title={node.designation}>
            {node.designation}
          </p>
          <Badge className="bg-primary/10 text-primary border-0 text-[8px] font-bold mt-1.5 py-0.5 px-2 rounded-sm capitalize">
            {node.department}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="Organization Directory"
        subtitle="Explore department profiles and the corporate reporting hierarchy tree"
      />

      {/* ── Organization Statistics ────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Company Headquarters"
          value="Sedin Technologies"
          icon={Building}
          trend={{ value: "Chennai, India", direction: "up", label: "main hub" }}
        />
        <StatCard
          label="Total Active Headcount"
          value="248 Employees"
          icon={Users}
          trend={{ value: "3 Locations", direction: "up", label: "worldwide" }}
        />
        <StatCard
          label="Active Divisions"
          value="4 Departments"
          icon={Layers}
          iconClassName="bg-primary/10 text-primary"
          trend={{ value: "95% Utilization", direction: "up", label: "rate" }}
        />
      </div>

      {/* ── Department Directory Grid ──────────────────────── */}
      <SectionCard title="Departments" description="Breakdown of core divisions and team leads">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.name}
              className="flex flex-col justify-between p-4 rounded-2xl border border-border bg-card shadow-xs relative overflow-hidden"
            >
              {/* Colored left strip accent */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${dept.color}`} />
              <div className="pl-2 space-y-1.5">
                <h4 className="text-sm font-bold text-foreground">{dept.name}</h4>
                <p className="text-xs text-muted-foreground font-medium">
                  Head: <span className="font-semibold text-foreground/80">{dept.lead}</span>
                </p>
              </div>
              <div className="pl-2 pt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Team Size:</span>
                <span className="text-sm font-bold text-primary">{dept.count} Members</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Hierarchy Tree Structure ───────────────────────── */}
      <SectionCard
        title="Reporting Tree Hierarchy"
        description="Visual overview of the leadership and reports structure"
      >
        <div className="flex flex-col items-center py-6 overflow-x-auto w-full min-w-[700px]">
          {/* Level 1: CEO */}
          <div className="flex justify-center w-full">
            {renderMemberCard(orgTree)}
          </div>

          {/* Connective Line Level 1 -> Level 2 */}
          <div className="h-6 w-0.5 bg-border mt-0" />

          {/* Connective Horizontal Bar Level 2 */}
          <div className="relative w-[480px] h-0.5 bg-border" />

          {/* Middle Level Verticals */}
          <div className="flex justify-between w-[480px] px-[88px]">
            <div className="h-4 w-0.5 bg-border" />
            <div className="h-4 w-0.5 bg-border" />
          </div>

          {/* Level 2: VP HR and VP Engineering */}
          <div className="flex justify-between gap-16 w-full max-w-2xl px-6">
            {/* VP HR Column */}
            <div className="flex flex-col items-center flex-1">
              {renderMemberCard(orgTree.children![0])}

              {/* Connective Line VP HR -> Staff */}
              <div className="h-6 w-0.5 bg-border" />
              {renderMemberCard(orgTree.children![0].children![0])}
            </div>

            {/* VP Engineering Column */}
            <div className="flex flex-col items-center flex-1">
              {renderMemberCard(orgTree.children![1])}

              {/* Connective Line VP Engineering -> Staff */}
              <div className="h-6 w-0.5 bg-border" />

              {/* Connective Horizontal Bar for VP Eng staff */}
              <div className="relative w-[240px] h-0.5 bg-border" />

              {/* VP Eng staff verticals */}
              <div className="flex justify-between w-[240px] px-[48px]">
                <div className="h-4 w-0.5 bg-border" />
                <div className="h-4 w-0.5 bg-border" />
              </div>

              {/* Level 3 staff under VP Eng */}
              <div className="flex justify-between gap-6">
                {renderMemberCard(orgTree.children![1].children![0])}
                {renderMemberCard(orgTree.children![1].children![1])}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </PageContainer>
  );
}
