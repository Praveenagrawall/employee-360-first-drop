package com.kpmg.employee360.config;

import com.kpmg.employee360.entity.*;
import com.kpmg.employee360.enums.*;
import com.kpmg.employee360.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

import java.time.LocalDate;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

        private final DesignationRepository designationRepo;
        private final EmployeeRepository employeeRepo;
        private final ProjectRepository projectRepo;
        private final TeamRepository teamRepo;
        private final TeamMemberRepository teamMemberRepo;
        private final PerformanceReviewRepository reviewRepo;
        private final FeedbackRepository feedbackRepo;
        private final AllocationRequestRepository allocationRequestRepo;
        private final NotificationRepository notificationRepo;

        @Override
        @Transactional
        public void run(String... args) {
                log.info("========== Loading KPMG Employee 360 dummy data ==========");

                // ===== DESIGNATIONS =====
                Designation assocConsultant = designationRepo.save(
                                Designation.builder().name("ASSOCIATE_CONSULTANT").displayName("Associate Consultant")
                                                .level(1).dashboardType(DashboardType.INDIVIDUAL).build());
                Designation consultant = designationRepo.save(Designation.builder().name("CONSULTANT")
                                .displayName("Consultant").level(2).dashboardType(DashboardType.INDIVIDUAL).build());
                Designation asstManager = designationRepo
                                .save(Designation.builder().name("ASSISTANT_MANAGER").displayName("Assistant Manager")
                                                .level(3).dashboardType(DashboardType.INDIVIDUAL).build());
                Designation managerDesig = designationRepo.save(Designation.builder().name("MANAGER")
                                .displayName("Manager").level(4).dashboardType(DashboardType.MANAGER).build());
                Designation asstDirector = designationRepo.save(Designation.builder().name("ASSISTANT_DIRECTOR")
                                .displayName("Assistant Director").level(5).dashboardType(DashboardType.MANAGER)
                                .build());
                Designation director = designationRepo.save(Designation.builder().name("DIRECTOR")
                                .displayName("Director").level(6).dashboardType(DashboardType.LEADERSHIP).build());
                Designation partner = designationRepo.save(Designation.builder().name("PARTNER").displayName("Partner")
                                .level(7).dashboardType(DashboardType.LEADERSHIP).build());

                log.info("Loaded 7 designations");

                // ===== EMPLOYEES =====

                // --- Partners ---
                Employee mallikarjun = createEmployee("KPMG001", "Mallikarjun", "Kandkuru",
                                partner, "Digital Lighthouse",
                                "mallikarjun.kandkuru@kpmg.com", null);
                Employee vikram = createEmployee("KPMG002", "Vikram", "Sharma",
                                partner, "Tax & Advisory", "vikram.sharma@kpmg.com", null);

                // --- Directors ---
                Employee srinivas = createEmployee("KPMG003", "Srinivas", "Rao",
                                director, "Digital Lighthouse", "srinivas.rao@kpmg.com",
                                mallikarjun);
                Employee priya = createEmployee("KPMG004", "Priya", "Menon",
                                director, "Tax & Advisory", "priya.menon@kpmg.com", vikram);

                // --- Assistant Directors ---
                Employee rajesh = createEmployee("KPMG005", "Rajesh", "Kumar",
                                asstDirector, "Digital Lighthouse", "rajesh.kumar@kpmg.com",
                                srinivas);
                Employee anita = createEmployee("KPMG006", "Anita", "Deshmukh",
                                asstDirector, "Tax & Advisory", "anita.deshmukh@kpmg.com", priya);

                // --- Managers ---
                Employee karthik = createEmployee("KPMG007", "Karthik", "Pai",
                                managerDesig, "Digital Lighthouse", "karthik.pai@kpmg.com",
                                rajesh);
                Employee sohail = createEmployee("KPMG008", "Sohail", "Arabi",
                                managerDesig, "Digital Lighthouse", "sohail.arabi@kpmg.com",
                                rajesh);
                Employee akanksha = createEmployee("KPMG009", "Akanksha", "Arora",
                                managerDesig, "Tax & Advisory", "akanksha.arora@kpmg.com",
                                anita);
                Employee deepak = createEmployee("KPMG010", "Deepak", "Verma",
                                managerDesig, "Digital Lighthouse", "deepak.verma@kpmg.com",
                                srinivas);

                // --- Assistant Managers ---
                Employee neha = createEmployee("KPMG011", "Neha", "Gupta",
                                asstManager, "Digital Lighthouse", "neha.gupta@kpmg.com",
                                karthik);
                Employee amit = createEmployee("KPMG012", "Amit", "Singh",
                                asstManager, "Digital Lighthouse", "amit.singh@kpmg.com",
                                sohail);
                Employee sneha = createEmployee("KPMG013", "Sneha", "Reddy",
                                asstManager, "Tax & Advisory", "sneha.reddy@kpmg.com",
                                akanksha);
                Employee rohit = createEmployee("KPMG014", "Rohit", "Joshi",
                                asstManager, "Digital Lighthouse", "rohit.joshi@kpmg.com",
                                deepak);

                // --- Consultants ---
                // Praveen (YOU!) - reports to Karthik, perf manager is also Karthik
                Employee praveen = createEmployee("KPMG015", "Praveen", "Agrawal",
                                consultant, "Digital Lighthouse", "praveen.agrawal@kpmg.com",
                                karthik, karthik, "Bangalore", LocalDate.of(2021, 7, 5));
                Employee divya = createEmployee("KPMG016", "Divya", "Nair",
                                consultant, "Digital Lighthouse", "divya.nair@kpmg.com",
                                karthik);
                Employee arjun = createEmployee("KPMG017", "Arjun", "Mehta",
                                consultant, "Digital Lighthouse", "arjun.mehta@kpmg.com",
                                sohail);
                Employee pooja = createEmployee("KPMG018", "Pooja", "Iyer",
                                consultant, "Tax & Advisory", "pooja.iyer@kpmg.com",
                                akanksha);
                Employee manish = createEmployee("KPMG019", "Manish", "Tiwari",
                                consultant, "Digital Lighthouse", "manish.tiwari@kpmg.com",
                                deepak);

                // --- Associate Consultants ---
                Employee riya = createEmployee("KPMG020", "Riya", "Patel",
                                assocConsultant, "Digital Lighthouse", "riya.patel@kpmg.com",
                                neha);
                Employee varun = createEmployee("KPMG021", "Varun", "Chauhan",
                                assocConsultant, "Digital Lighthouse", "varun.chauhan@kpmg.com",
                                neha);
                Employee kavya = createEmployee("KPMG022", "Kavya", "Bhat",
                                assocConsultant, "Tax & Advisory", "kavya.bhat@kpmg.com",
                                sneha);
                Employee nikhil = createEmployee("KPMG023", "Nikhil", "Saxena",
                                assocConsultant, "Digital Lighthouse", "nikhil.saxena@kpmg.com",
                                rohit);

                // --- New Employees ---
                Employee aditya = createEmployee("KPMG024", "Aditya", "Sharma",
                                assocConsultant, "Digital Lighthouse", "aditya.sharma@kpmg.com",
                                amit, sohail, "Bangalore", LocalDate.of(2024, 3, 15));
                Employee priyanka = createEmployee("KPMG025", "Priyanka", "Kapoor",
                                consultant, "Tax & Advisory", "priyanka.kapoor@kpmg.com",
                                akanksha, priya, "Mumbai", LocalDate.of(2022, 7, 1));
                Employee rahul = createEmployee("KPMG026", "Rahul", "Dravid",
                                asstManager, "Digital Lighthouse", "rahul.dravid@kpmg.com",
                                deepak, deepak, "Hyderabad", LocalDate.of(2020, 1, 10));
                Employee meera = createEmployee("KPMG027", "Meera", "Krishnan",
                                managerDesig, "Digital Lighthouse", "meera.krishnan@kpmg.com",
                                srinivas, srinivas, "Chennai", LocalDate.of(2018, 6, 1));
                Employee suresh = createEmployee("KPMG028", "Suresh", "Pillai",
                                asstDirector, "Tax & Advisory", "suresh.pillai@kpmg.com",
                                priya, vikram, "Mumbai", LocalDate.of(2016, 2, 15));
                Employee tanvi = createEmployee("KPMG029", "Tanvi", "Shah",
                                assocConsultant, "Digital Lighthouse", "tanvi.shah@kpmg.com",
                                neha, karthik, "Bangalore", LocalDate.of(2024, 7, 1));
                Employee kartikR = createEmployee("KPMG030", "Kartik", "Raman",
                                consultant, "Digital Lighthouse", "kartik.raman@kpmg.com",
                                meera, srinivas, "Chennai", LocalDate.of(2023, 1, 10));

                // Kratika Sharma — Manager, reports to Rajesh (Assistant Director), perf mgr
                // Srinivas (Director)
                Employee kratika = createEmployee("KPMG031", "Kratika", "Sharma",
                                managerDesig, "Digital Lighthouse", "kratika.sharma@kpmg.com",
                                rajesh, srinivas, "Bangalore", LocalDate.of(2017, 11, 1));

                // Gagan Yadav — Associate Consultant, reports to Neha (Assistant Manager), perf
                // mgr Karthik (Manager)
                Employee gagan = createEmployee("KPMG032", "Gagan", "Yadav",
                                assocConsultant, "Digital Lighthouse", "gagan.yadav@kpmg.com",
                                neha, karthik, "Bangalore", LocalDate.of(2024, 6, 15));

                // Raj Chouhan — Consultant, reports to Karthik (Manager), perf mgr Karthik
                // (Manager)
                Employee raj = createEmployee("KPMG033", "Raj", "Chouhan",
                                consultant, "Digital Lighthouse", "raj.chouhan@kpmg.com",
                                karthik, karthik, "Bangalore", LocalDate.of(2022, 8, 1));

                log.info("Loaded 33 employees");

                // ===== PROJECTS =====

                // Client Projects
                Project hdfc = projectRepo.save(Project.builder()
                                .projectCode("PRJ-CLIENT-001").name("HDFC Digital Transformation")
                                .description("End-to-end digital transformation for HDFC Bank including core banking modernization, API gateway, and mobile app revamp.")
                                .type(ProjectType.CLIENT).status(ProjectStatus.ACTIVE).clientName("HDFC Bank")
                                .startDate(LocalDate.of(2025, 1, 15)).endDate(LocalDate.of(2025, 12, 31))
                                .engagementManager(karthik).build());

                Project reliance = projectRepo.save(Project.builder()
                                .projectCode("PRJ-CLIENT-002").name("Reliance SAP S/4HANA Migration")
                                .description("SAP ECC to S/4HANA migration for Reliance Industries including data migration, custom development, and testing.")
                                .type(ProjectType.CLIENT).status(ProjectStatus.ACTIVE).clientName("Reliance Industries")
                                .startDate(LocalDate.of(2025, 3, 1)).endDate(LocalDate.of(2026, 6, 30))
                                .engagementManager(sohail).build());

                Project infosys = projectRepo.save(Project.builder()
                                .projectCode("PRJ-CLIENT-003").name("Infosys Cloud Audit & Compliance")
                                .description("Cloud infrastructure audit and compliance assessment for Infosys across AWS and Azure environments.")
                                .type(ProjectType.CLIENT).status(ProjectStatus.ACTIVE).clientName("Infosys Ltd")
                                .startDate(LocalDate.of(2025, 6, 1)).endDate(LocalDate.of(2025, 11, 30))
                                .engagementManager(akanksha).build());

                // Internal Projects
                Project emp360 = projectRepo.save(Project.builder()
                                .projectCode("PRJ-INT-001").name("Employee 360 Dashboard")
                                .description("Internal application to provide complete employee view — org hierarchy, teams, projects, performance, feedback.")
                                .type(ProjectType.INTERNAL).status(ProjectStatus.ACTIVE)
                                .startDate(LocalDate.of(2025, 9, 1)).endDate(LocalDate.of(2026, 3, 31))
                                .engagementManager(karthik).build());

                Project knowledgePortal = projectRepo.save(Project.builder()
                                .projectCode("PRJ-INT-002").name("KPMG Knowledge Portal")
                                .description("Internal knowledge management system for sharing best practices, templates, and training materials.")
                                .type(ProjectType.INTERNAL).status(ProjectStatus.ACTIVE)
                                .startDate(LocalDate.of(2025, 4, 1)).endDate(LocalDate.of(2025, 12, 31))
                                .engagementManager(deepak).build());

                // Proposal Projects
                Project tcsProposal = projectRepo.save(Project.builder()
                                .projectCode("PRJ-PROP-001").name("TCS Data Analytics Proposal")
                                .description("Proposal for TCS to implement enterprise data analytics platform using Databricks and Power BI.")
                                .type(ProjectType.PROPOSAL).status(ProjectStatus.PIPELINE).clientName("TCS")
                                .startDate(LocalDate.of(2025, 10, 1)).engagementManager(sohail).build());

                Project wipro = projectRepo.save(Project.builder()
                                .projectCode("PRJ-CLIENT-004").name("Wipro Cybersecurity Assessment")
                                .description("End-to-end cybersecurity assessment for Wipro Ltd including threat modeling, penetration testing, and compliance audit.")
                                .type(ProjectType.CLIENT).status(ProjectStatus.ACTIVE).clientName("Wipro Ltd")
                                .startDate(LocalDate.of(2025, 8, 1)).endDate(LocalDate.of(2026, 2, 28))
                                .engagementManager(deepak).build());

                Project trainingAcademy = projectRepo.save(Project.builder()
                                .projectCode("PRJ-INT-003").name("KPMG Training Academy Portal")
                                .description("Internal portal for KPMG employees to access training materials, certifications, and learning paths.")
                                .type(ProjectType.INTERNAL).status(ProjectStatus.ACTIVE)
                                .startDate(LocalDate.of(2025, 11, 1)).endDate(LocalDate.of(2026, 6, 30))
                                .engagementManager(meera).build());

                Project shellAudit = projectRepo.save(Project.builder()
                                .projectCode("PRJ007").name("Shell Tax Audit")
                                .description("External tax audit for Shell including statutory compliance and risk assessment.")
                                .type(ProjectType.CLIENT).status(ProjectStatus.ACTIVE).clientName("Shell")
                                .startDate(LocalDate.of(2024, 1, 1)).endDate(LocalDate.of(2024, 12, 31))
                                .engagementManager(priya).build());

                Project relianceAI = projectRepo.save(Project.builder()
                                .projectCode("PRJ008").name("Reliance AI Strategy")
                                .description("Strategic AI roadmap and implementation for Reliance Digital.")
                                .type(ProjectType.CLIENT).status(ProjectStatus.ACTIVE).clientName("Reliance")
                                .startDate(LocalDate.of(2024, 6, 1)).endDate(LocalDate.of(2025, 3, 31))
                                .engagementManager(sohail).build());

                log.info("Loaded 10 projects");

                // ===== TEAMS & MEMBERS =====

                // HDFC Team
                Team hdfcTeam = teamRepo.save(
                                Team.builder().name("HDFC Digital Core Team").project(hdfc).teamLead(neha).build());
                addMember(hdfcTeam, neha, "Tech Lead", 80);
                addMember(hdfcTeam, praveen, "Java Developer", 60);
                addMember(hdfcTeam, divya, "Full Stack Developer", 80);
                addMember(hdfcTeam, riya, "Junior Developer", 100);
                addMember(hdfcTeam, varun, "QA Analyst", 100);

                // Reliance Team
                Team relianceTeam = teamRepo.save(Team.builder().name("Reliance SAP Migration Team").project(reliance)
                                .teamLead(amit).build());
                addMember(relianceTeam, amit, "SAP Lead", 100);
                addMember(relianceTeam, arjun, "SAP Developer", 100);

                // Infosys Team
                Team infosysTeam = teamRepo.save(Team.builder().name("Infosys Cloud Audit Team").project(infosys)
                                .teamLead(sneha).build());
                addMember(infosysTeam, sneha, "Audit Lead", 80);
                addMember(infosysTeam, pooja, "Cloud Analyst", 100);
                addMember(infosysTeam, kavya, "Junior Analyst", 100);

                // Employee 360 Team (the project you're building!)
                Team emp360Team = teamRepo.save(
                                Team.builder().name("Employee 360 Dev Team").project(emp360).teamLead(neha).build());
                addMember(emp360Team, praveen, "Lead Developer", 40);
                addMember(emp360Team, divya, "Frontend Developer", 20);
                addMember(emp360Team, gagan, "Junior Developer", 70);
                addMember(emp360Team, raj, "Backend Developer", 60);

                // Update HDFC Team with Gagan and Raj
                addMember(hdfcTeam, gagan, "Junior QA", 30);
                addMember(hdfcTeam, raj, "Java Developer", 40);

                // Knowledge Portal Team
                Team kpTeam = teamRepo.save(Team.builder().name("Knowledge Portal Team").project(knowledgePortal)
                                .teamLead(rohit).build());
                addMember(kpTeam, rohit, "Tech Lead", 80);
                addMember(kpTeam, manish, "Backend Developer", 100);
                addMember(kpTeam, nikhil, "Junior Developer", 100);

                // TCS Proposal Team
                Team tcsTeam = teamRepo.save(
                                Team.builder().name("TCS Proposal Team").project(tcsProposal).teamLead(amit).build());
                addMember(tcsTeam, amit, "Solution Architect", 20);
                addMember(tcsTeam, arjun, "Data Analyst", 20);

                // Wipro Team
                Team wiproTeam = teamRepo.save(Team.builder().name("Wipro Security Team").project(wipro)
                                .teamLead(rohit).build());
                addMember(wiproTeam, rohit, "Tech Lead", 60);
                addMember(wiproTeam, manish, "Security Analyst", 80);
                addMember(wiproTeam, nikhil, "Junior Analyst", 50);
                addMember(wiproTeam, rahul, "Lead Analyst", 100);

                // Training Academy Team
                Team trainingTeam = teamRepo.save(Team.builder().name("Training Academy Team").project(trainingAcademy)
                                .teamLead(meera).build());
                addMember(trainingTeam, meera, "Project Lead", 40);
                addMember(trainingTeam, kartikR, "Developer", 100);
                addMember(trainingTeam, tanvi, "Junior Dev", 100);

                // Update Reliance Team (SAP)
                addMember(relianceTeam, aditya, "Junior SAP Dev", 100);

                // Shell Audit Team
                Team shellTeam = teamRepo.save(Team.builder().name("Team Shell Audit").project(shellAudit)
                                .teamLead(priyanka).build());
                addMember(shellTeam, priyanka, "Audit Lead", 100);
                addMember(shellTeam, suresh, "Engagement Manager", 100);

                // Reliance AI Team
                Team relianceAITeam = teamRepo.save(Team.builder().name("Team Reliance AI").project(relianceAI)
                                .teamLead(rahul).build());
                addMember(relianceAITeam, rahul, "Lead AI Consultant", 50);
                addMember(relianceAITeam, kartikR, "AI Developer", 100);

                // Update Rahul's other allocation (Cloud Migration / Infosys Cloud Audit)
                addMember(infosysTeam, rahul, "Cloud Security Expert", 50);

                log.info("Loaded 10 teams with members");

                // ===== PERFORMANCE REVIEWS =====

                // FY2025-H1 Reviews
                saveReview(praveen, karthik, "FY2025-H1", 4,
                                "Exceeded expectations on HDFC project. Strong Java skills.",
                                "Improve communication with stakeholders. Take ownership of design decisions.",
                                ReviewStatus.COMPLETED, LocalDate.of(2025, 6, 30));
                saveReview(divya, karthik, "FY2025-H1", 4, "Excellent frontend work. Good team player.",
                                "Work on backend skills to become full stack.", ReviewStatus.COMPLETED,
                                LocalDate.of(2025, 6, 30));
                saveReview(neha, karthik, "FY2025-H1", 5,
                                "Outstanding leadership on HDFC project. Mentoring juniors well.",
                                "Ready for manager role.", ReviewStatus.COMPLETED, LocalDate.of(2025, 6, 30));
                saveReview(arjun, sohail, "FY2025-H1", 3, "Meets expectations. Solid SAP ABAP skills.",
                                "Needs to improve time management and proactive communication.", ReviewStatus.COMPLETED,
                                LocalDate.of(2025, 6, 30));
                saveReview(amit, sohail, "FY2025-H1", 4, "Strong technical leadership on Reliance project.",
                                "Could improve delegation skills.", ReviewStatus.COMPLETED, LocalDate.of(2025, 6, 30));
                saveReview(riya, neha, "FY2025-H1", 3, "Good progress for first year. Learning quickly.",
                                "Needs to work on code quality and testing practices.", ReviewStatus.COMPLETED,
                                LocalDate.of(2025, 6, 30));
                saveReview(varun, neha, "FY2025-H1", 4, "Excellent QA work. Found critical bugs before release.",
                                "Learn automation testing frameworks.", ReviewStatus.COMPLETED,
                                LocalDate.of(2025, 6, 30));
                saveReview(pooja, akanksha, "FY2025-H1", 4, "Strong analytical skills in cloud audit.",
                                "Get AWS certification.", ReviewStatus.COMPLETED, LocalDate.of(2025, 6, 30));
                saveReview(manish, deepak, "FY2025-H1", 3, "Reliable developer. Good knowledge of Spring Boot.",
                                "Take initiative on architecture decisions.", ReviewStatus.COMPLETED,
                                LocalDate.of(2025, 6, 30));
                saveReview(rohit, deepak, "FY2025-H1", 5, "Exceptional performance leading Knowledge Portal.",
                                "Continue growing leadership skills.", ReviewStatus.COMPLETED,
                                LocalDate.of(2025, 6, 30));

                // Year-End 2024 Reviews
                saveReview(aditya, amit, "Year-End 2024", 4,
                                "Strong start, good technical skills.", "Master advanced Java concepts and SQL",
                                ReviewStatus.COMPLETED, LocalDate.of(2024, 12, 15));
                saveReview(priyanka, akanksha, "Year-End 2024", 5,
                                "Exceptional delivery on audit projects.", "Prepare for senior consultant role",
                                ReviewStatus.COMPLETED, LocalDate.of(2024, 12, 20));

                // FY2025-H2 Reviews (some pending)
                saveReview(praveen, karthik, "FY2025-H2", 4,
                                "Continuing strong performance. Leading Employee 360 development.",
                                "Present technical designs to senior leadership.", ReviewStatus.COMPLETED,
                                LocalDate.of(2025, 12, 31));
                saveReview(divya, karthik, "FY2025-H2", 5, "Significantly improved. Now truly full stack.",
                                "Ready for Senior Consultant promotion.", ReviewStatus.COMPLETED,
                                LocalDate.of(2025, 12, 31));
                saveReview(neha, karthik, "FY2025-H2", 5,
                                "Consistent top performer. Leading two projects simultaneously.",
                                "Prepare for manager transition.", ReviewStatus.COMPLETED, LocalDate.of(2025, 12, 31));
                saveReview(riya, neha, "FY2025-H2", 4, "Major improvement in code quality. Taking ownership.",
                                "Start contributing to architectural discussions.", ReviewStatus.SUBMITTED,
                                LocalDate.of(2025, 12, 31));
                saveReview(arjun, sohail, "FY2025-H2", 4, "Improved significantly. Leading TCS proposal data work.",
                                "Continue improving presentation skills.", ReviewStatus.DRAFT,
                                LocalDate.of(2025, 12, 31));

                // Reviews for New Employees
                saveReview(kratika, rajesh, "FY2025-H1", 4, "Strong project management skills. Effective team leader.",
                                "Continue developing client relationships.", ReviewStatus.COMPLETED,
                                LocalDate.of(2025, 6, 30));
                saveReview(kratika, rajesh, "FY2025-H2", 4, "Consistent delivery and team development.",
                                "Take on larger engagement leadership.", ReviewStatus.COMPLETED,
                                LocalDate.of(2025, 12, 31));
                saveReview(gagan, neha, "FY2025-H2", 3, "Good start to KPMG career. Learning quickly.",
                                "Improve code testing practices. Get comfortable with Spring Boot.",
                                ReviewStatus.COMPLETED, LocalDate.of(2025, 12, 31));
                saveReview(raj, karthik, "FY2025-H1", 4, "Strong Java and Spring Boot skills. Reliable developer.",
                                "Take more ownership of design decisions.", ReviewStatus.COMPLETED,
                                LocalDate.of(2025, 6, 30));
                saveReview(raj, karthik, "FY2025-H2", 4,
                                "Consistent performance. Good collaboration with Praveen on Employee 360.",
                                "Start mentoring junior team members.", ReviewStatus.COMPLETED,
                                LocalDate.of(2025, 12, 31));

                // FY2026-H1 DRAFT Reviews for new employees
                saveReview(kratika, rajesh, "FY2026-H1", 0, null, "Lead new client engagement successfully.",
                                ReviewStatus.DRAFT, null);
                saveReview(gagan, neha, "FY2026-H1", 0, null,
                                "Complete Spring Boot training. Deliver Employee 360 QA milestones.",
                                ReviewStatus.DRAFT, null);
                saveReview(raj, karthik, "FY2026-H1", 0, null, "Lead Employee 360 backend feature development.",
                                ReviewStatus.DRAFT, null);

                log.info("Loaded 33+ performance reviews");

                // ===== FEEDBACK =====

                // Peer Feedback
                saveFeedback(divya, praveen, hdfc, FeedbackType.PEER,
                                "Great to work with Praveen on HDFC. He's very thorough with code reviews and always willing to help.",
                                4, false);
                saveFeedback(riya, praveen, hdfc, FeedbackType.PEER,
                                "Praveen helped me understand Spring Boot architecture. Excellent mentor.", 5, false);
                saveFeedback(praveen, divya, hdfc, FeedbackType.PEER,
                                "Divya's React skills are impressive. She delivers pixel-perfect UIs consistently.", 5,
                                false);
                saveFeedback(arjun, amit, reliance, FeedbackType.PEER,
                                "Amit is a strong lead. Clear communication and technical guidance.", 4, false);
                saveFeedback(pooja, sneha, infosys, FeedbackType.PEER,
                                "Sneha's audit methodology is very structured. Learned a lot.", 5, false);
                saveFeedback(varun, riya, hdfc, FeedbackType.PEER,
                                "Riya has improved a lot this quarter. Her code quality is much better.", 4, false);
                saveFeedback(manish, rohit, knowledgePortal, FeedbackType.PEER,
                                "Rohit is an excellent tech lead. Makes complex problems simple.", 5, false);

                // Upward Feedback (to managers)
                saveFeedback(praveen, karthik, null, FeedbackType.UPWARD,
                                "Karthik is a supportive manager. Gives clear direction and trusts the team.", 4, true);
                saveFeedback(neha, karthik, null, FeedbackType.UPWARD,
                                "Great mentor. Could improve on giving more frequent feedback.", 4, false);
                saveFeedback(arjun, sohail, null, FeedbackType.UPWARD,
                                "Sohail is approachable and technically sound. Good manager.", 4, true);
                saveFeedback(pooja, akanksha, null, FeedbackType.UPWARD,
                                "Akanksha provides good career guidance and growth opportunities.", 5, false);

                // Downward Feedback (from managers)
                saveFeedback(karthik, praveen, hdfc, FeedbackType.DOWNWARD,
                                "Praveen is one of the strongest developers on my team. Shows initiative and ownership. Ready for more responsibility.",
                                4, false);
                saveFeedback(karthik, neha, hdfc, FeedbackType.DOWNWARD,
                                "Neha has been exceptional this year. Leading multiple projects with ease. Strongly recommend for promotion.",
                                5, false);
                saveFeedback(sohail, arjun, reliance, FeedbackType.DOWNWARD,
                                "Arjun has improved his time management. Good SAP skills. Encourage him to take on more complex modules.",
                                3, false);
                saveFeedback(deepak, rohit, knowledgePortal, FeedbackType.DOWNWARD,
                                "Rohit is a natural leader. Knowledge Portal is ahead of schedule thanks to his efforts.",
                                5, false);

                // --- New Feedback for Kratika, Gagan, Raj ---
                saveFeedback(praveen, raj, emp360, FeedbackType.PEER,
                                "Raj is an excellent backend developer. Great to collaborate with on Employee 360. His Spring Boot expertise has been invaluable.",
                                5, false);
                saveFeedback(raj, praveen, emp360, FeedbackType.PEER,
                                "Praveen is a strong lead developer. Takes ownership and mentors the team well. Really drives the Employee 360 project forward.",
                                5, false);
                saveFeedback(gagan, praveen, emp360, FeedbackType.PEER,
                                "Praveen has been a great mentor. Always patient in explaining architecture decisions and code review feedback.",
                                5, false);
                saveFeedback(gagan, raj, emp360, FeedbackType.PEER,
                                "Raj helped me understand the backend codebase quickly. Very supportive teammate.", 4,
                                false);
                saveFeedback(praveen, gagan, emp360, FeedbackType.PEER,
                                "Gagan is eager to learn and improving rapidly. Good attitude and work ethic.", 4,
                                false);
                saveFeedback(raj, gagan, emp360, FeedbackType.PEER,
                                "Gagan is a fast learner. His QA contributions to HDFC have been solid for someone so new.",
                                4, false);
                saveFeedback(raj, karthik, null, FeedbackType.UPWARD,
                                "Karthik gives clear direction and trusts the team. Supportive manager.", 4, false);
                saveFeedback(gagan, neha, null, FeedbackType.UPWARD,
                                "Neha is an excellent mentor. Very approachable and helpful.", 5, true);
                saveFeedback(karthik, raj, emp360, FeedbackType.DOWNWARD,
                                "Raj has been instrumental in Employee 360 backend development. Strong technical skills and great team player.",
                                4, false);
                saveFeedback(karthik, kratika, null, FeedbackType.DOWNWARD,
                                "Kratika manages her team effectively. Good communication and project delivery.", 4,
                                false);
                saveFeedback(neha, gagan, emp360, FeedbackType.DOWNWARD,
                                "Gagan is progressing well for a new joiner. Keep pushing on code quality.", 3, false);

                log.info("Loaded 35+ feedback entries");

                // ===== ALLOCATION REQUESTS =====

                // Praveen requested for Reliance team by Sohail (Manager), approved by Karthik
                // (praveen's manager)
                saveAllocationRequest(praveen, relianceTeam, reliance, sohail, karthik, "Senior Backend Dev", 40,
                                60, LocalDate.of(2025, 6, 1), LocalDate.of(2025, 12, 31),
                                AllocationRequestStatus.PENDING, "Need strong Java dev for S/4HANA integrations.", null,
                                null);

                // Divya requested for Knowledge Portal by Rohit, rejected by Karthik
                saveAllocationRequest(divya, kpTeam, knowledgePortal, rohit, karthik, "UI Expert", 50,
                                100, LocalDate.of(2025, 4, 1), LocalDate.of(2025, 8, 31),
                                AllocationRequestStatus.REJECTED, "Need UI help for portal revamp.",
                                "Divya is already over-allocated to HDFC.", "Cannot spare her right now.");

                // Raj requested for Wipro by Rohit, approved by Karthik
                saveAllocationRequest(raj, wiproTeam, wipro, rohit, karthik, "Backend Security", 30,
                                100, LocalDate.of(2025, 8, 1), LocalDate.of(2026, 1, 31),
                                AllocationRequestStatus.APPROVED, "Requires Spring Security expertise.", null,
                                "Approved for 30%.");

                log.info("Loaded allocation requests");

                AllocationRequest req1 = saveAllocationRequest(manish, hdfcTeam, hdfc, karthik, deepak,
                                "Backend Developer", 40,
                                60, LocalDate.of(2025, 3, 1), LocalDate.of(2025, 8, 31),
                                AllocationRequestStatus.PENDING, "Need additional Spring Boot developer for Phase 2",
                                null,
                                null);

                notificationRepo.save(Notification.builder()
                                .recipient(deepak)
                                .title("New Allocation Request")
                                .message("New allocation request from Karthik Pai for Manish Kumar on HDFC Digital Transformation")
                                .type("ALLOCATION_REQUEST")
                                .referenceId(req1.getId())
                                .referenceType("ALLOCATION_REQUEST")
                                .build());

                AllocationRequest req2 = saveAllocationRequest(riya, relianceTeam, reliance, sohail, karthik,
                                "QA Support", 30,
                                100, LocalDate.of(2025, 4, 1), LocalDate.of(2025, 9, 30),
                                AllocationRequestStatus.PENDING, "Need QA support for UAT phase", null,
                                null);

                notificationRepo.save(Notification.builder()
                                .recipient(karthik)
                                .title("New Allocation Request")
                                .message("New allocation request from Sohail Arabi for Riya Singh on Reliance Retail Modernization")
                                .type("ALLOCATION_REQUEST")
                                .referenceId(req2.getId())
                                .referenceType("ALLOCATION_REQUEST")
                                .build());

                AllocationRequest req3 = saveAllocationRequest(praveen, wiproTeam, wipro, deepak, karthik,
                                "Technical Consultant", 20,
                                100, LocalDate.of(2025, 5, 1), LocalDate.of(2025, 10, 31),
                                AllocationRequestStatus.PENDING,
                                "Need Praveen's expertise for security architecture review", null,
                                null);

                notificationRepo.save(Notification.builder()
                                .recipient(karthik)
                                .title("New Allocation Request")
                                .message("New allocation request from Deepak Verma for Praveen Agrawal on Wipro Cybersecurity Audit")
                                .type("ALLOCATION_REQUEST")
                                .referenceId(req3.getId())
                                .referenceType("ALLOCATION_REQUEST")
                                .build());

                log.info("========== Data loading complete! ==========");
                log.info("Try: http://localhost:8080/swagger-ui.html");
                log.info("Try: http://localhost:8080/api/v1/employees/15  (Praveen's 360 view)");
                log.info("Try: http://localhost:8080/api/v1/dashboard/15  (Praveen's dashboard)");
                log.info("Try: http://localhost:8080/api/v1/dashboard/7   (Karthik's manager dashboard)");
                log.info("Try: http://localhost:8080/api/v1/dashboard/1   (Mallikarjun's leadership dashboard)");
                log.info("Praveen's team: Praveen + Raj + Gagan + Divya on Employee 360");
        }

        // ===== HELPER METHODS =====

        private Employee createEmployee(String empCode, String firstName, String lastName, Designation designation,
                        String department, String email, Employee manager) {
                return createEmployee(empCode, firstName, lastName, designation, department, email, manager, manager,
                                "Bangalore", LocalDate.now().minusYears(2));
        }

        private Employee createEmployee(String empCode, String firstName, String lastName, Designation designation,
                        String department, String email, Employee reportingManager, Employee performanceManager,
                        String location, LocalDate doj) {
                return employeeRepo.save(Employee.builder()
                                .empCode(empCode)
                                .firstName(firstName)
                                .lastName(lastName)
                                .email(email)
                                .designation(designation)
                                .department(department)
                                .location(location)
                                .dateOfJoining(doj)
                                .reportingManager(reportingManager)
                                .performanceManager(performanceManager)
                                .isActive(true)
                                .build());
        }

        private void addMember(Team team, Employee employee, String role, int allocation) {
                teamMemberRepo.save(TeamMember.builder()
                                .team(team)
                                .employee(employee)
                                .roleInTeam(role)
                                .allocationPercentage(allocation)
                                .startDate(team.getProject().getStartDate())
                                .status(AllocationStatus.ACTIVE)
                                .build());
        }

        private void saveReview(Employee employee, Employee reviewer, String cycle, int rating,
                        String comments, String goals, ReviewStatus status, LocalDate reviewDate) {
                reviewRepo.save(PerformanceReview.builder()
                                .employee(employee)
                                .reviewer(reviewer)
                                .reviewCycle(cycle)
                                .rating(rating)
                                .comments(comments)
                                .goals(goals)
                                .status(status)
                                .reviewDate(reviewDate)
                                .build());
        }

        private void saveFeedback(Employee from, Employee to, Project project, FeedbackType type,
                        String content, int rating, boolean anonymous) {
                feedbackRepo.save(Feedback.builder()
                                .fromEmployee(from)
                                .toEmployee(to)
                                .project(project)
                                .type(type)
                                .content(content)
                                .rating(rating)
                                .isAnonymous(anonymous)
                                .build());
        }

        private AllocationRequest saveAllocationRequest(Employee employee, Team team, Project project,
                        Employee requester,
                        Employee approver,
                        String roleInTeam, int requestedAllocation, int currentTotalAllocation,
                        LocalDate proposedStartDate, LocalDate proposedEndDate, AllocationRequestStatus status,
                        String requestReason, String rejectionReason, String approverComments) {
                return allocationRequestRepo.save(AllocationRequest.builder()
                                .employee(employee)
                                .team(team)
                                .project(project)
                                .requester(requester)
                                .approver(approver)
                                .roleInTeam(roleInTeam)
                                .requestedAllocation(requestedAllocation)
                                .currentTotalAllocation(currentTotalAllocation)
                                .proposedStartDate(proposedStartDate)
                                .proposedEndDate(proposedEndDate)
                                .status(status)
                                .requestReason(requestReason)
                                .rejectionReason(rejectionReason)
                                .approverComments(approverComments)
                                .build());
        }
}
