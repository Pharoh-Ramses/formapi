import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
import fs from 'fs';
import path from 'path';
import { BupeIntake } from '../models/bupeIntake';

export async function generatePDF(data: BupeIntake): Promise<Buffer> {
    function formatDate(date: Date | undefined): string {
        if (!date) return 'Not provided';
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    return new Promise<Buffer>(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'a4',
                margins: { top: 72, left: 72, bottom: 72, right: 72 }
            });

            const buffers: Buffer[] = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Embed Inter font
            const interRegularPath = path.join(__dirname, '../assets/fonts/Inter_18pt-Regular.ttf');
            const interBlackPath = path.join(__dirname, '../assets/fonts/Inter_18pt-Black.ttf');
            const interBoldPath = path.join(__dirname, '../assets/fonts/Inter_18pt-Bold.ttf');
            doc.registerFont('Inter', interRegularPath);
            doc.registerFont('Inter-Black', interBlackPath);
            doc.registerFont('Inter-Bold', interBoldPath);

            // PDF document metadata
            doc.info.Title = 'Buprenorphine Form';
            doc.info.Author = 'Rume Health';
            doc.info.Subject = 'Buprenorphine Intake Form';
            doc.info.Keywords = 'Buprenorphine, Intake Form';

            // Start of the Header Section
            // Add SVG logo from URL
            const logoUrl = 'https://rumehealth.com/wp-content/uploads/2022/09/rume-logo.svg';
            const response = await fetch(logoUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const svgLogo = await response.text();
            SVGtoPDF(doc, svgLogo, 72, 72, { width: 200, height: 150 });

            // Add "Buprenorphine Form" header below the logo
            doc.font('Inter-Black').fontSize(18).fillColor('#1f3051');
            doc.text('Buprenorphine Form', 72, 130, { width: 200 });

            // Add info box on the opposite side
            const pageWidth = doc.page.width;
            const boxWidth = 200;
            const boxHeight = 85;
            const boxX = pageWidth - doc.page.margins.right - boxWidth;
            const boxY = 72; // Same y-position as the logo
            const cornerRadius = 8;

            // Function to draw a rounded rectangle
            function roundedRect(x: number, y: number, width: number, height: number, radius: number) {
                doc.moveTo(x + radius, y);
                doc.lineTo(x + width - radius, y);
                doc.quadraticCurveTo(x + width, y, x + width, y + radius);
                doc.lineTo(x + width, y + height - radius);
                doc.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                doc.lineTo(x + radius, y + height);
                doc.quadraticCurveTo(x, y + height, x, y + height - radius);
                doc.lineTo(x, y + radius);
                doc.quadraticCurveTo(x, y, x + radius, y);
                doc.fillAndStroke('#f0f0f0', '#808080');
            }

            function drawHorizontalLine(yPosition: number) {
                doc.moveTo(doc.page.margins.left, yPosition)
                    .lineTo(doc.page.width - doc.page.margins.right, yPosition)
                    .stroke();
            }

            // Draw the rounded rectangle
            roundedRect(boxX, boxY, boxWidth, boxHeight, cornerRadius);

            // Add text to the box
            doc.font('Inter').fontSize(10).fillColor('black');
            doc.text(`Event ID: ${data.event_id}`, boxX + 10, boxY + 15, { width: boxWidth - 20 });
            doc.text(`Submitted At: ${data.submitted_at}`, boxX + 10, boxY + 40, { width: boxWidth - 20 });
            // End of the Header Section
            // Reset the x-coordinate to the left margin
            doc.x = doc.page.margins.left;
            // Start of patient data section
            doc.moveDown(2);  // Add some space after the header
            doc.font('Inter-Black').fontSize(14).fillColor('#1f3051');
            doc.text('Patient Data', { underline: true });
            doc.moveDown();

            const patientFields = [
                { label: 'First Name', value: data.first_name },
                { label: 'Last Name', value: data.last_name },
                { label: 'Phone Number', value: data.phone_number },
                { label: 'Email', value: data.email },
                { label: 'Date of Birth', value: formatDate(data.date_of_birth) },
                { label: 'Sex', value: data.sex }
            ];

            patientFields.forEach(field => {
                doc.font('Inter-Bold').fontSize(12).fillColor('#1f3051');
                doc.text(`${field.label}: `, { continued: true });
                doc.font('Inter').fillColor('black');
                doc.text(field.value);
                doc.moveDown(0.5);
            });
            // End of patient data section
            //Info section
            doc.moveDown(2);
            doc.font('Inter-Bold').fontSize(14).fillColor('#1f3051');
            doc.text('Important Information about Buprenorphine:');
            doc.moveDown();
            doc.font('Inter').fontSize(10).fillColor('black');
            doc.text('Buprenorphine (aka: Suboxone, Subutex, Zubzolv, Sublocade) is an FDA approved medication used for the medically assisted treatment (MAT) of opi oid use disorder (addiction to heroin , fentanyl, Tramadol, Cratom and prescription painkillers).');
            doc.moveDown(1);
            doc.text('Buprenorphine can be used for detoxification or for maintenance therapy. Maintenance can be continued for as long as medically necessary. There are other medical treatments for opi oid addiction, including methadone and naltrexone. Medication alone may not be sufficient to treat addiction. For best results, you should also participate in recovery support therapy, which may include individual therapy, group therapy, peer support activities, narcotic anonymous meetings and residential rehabilitation. The risk of relapse to opioid use is very high when patient s stop taking buprenorphine, so you should not stop taking your medication without discussing it with your medical provider first.\n')
            doc.moveDown(1);
            doc.text('Buprenorphine is a partial opioid agonist. It binds very strongly to the opioid receptors in your brain and body, which helps to prevent cravings for opioid s. It also blocks other opioid s from binding to those receptors so if you try to use other opioid s they will not work (you cannot get high). Because buprenorphine binds more strongly to the receptors than other opioid s do, if you take buprenorphine while you still have other drugs in your system it will knock those drugs off the receptors which can ca use withdrawal. If you are dependent on opioid s, you should be in as much withdrawal as possible when you take the first dose of buprenorphine, and it will help you feel better. If you are not already in withdrawal, buprenorphine can cause severe opioid withdrawal.')
            doc.moveDown(1);
            doc.text('Some patients find it takes several days to get used to the transition from the opioid they have been using to buprenorphine. During that time, any use of other opioid s can cause an increase in symptoms. After you become stabilized on buprenorphine, other opioid s will have less effect, and attempts to override the effects of buprenorphine by taking more opioid s can result in fatal overdose. IV injection of Buprenorphine/naloxone can cause severe withdrawal symptoms. The beneficial effects of buprenorphine plateau at higher doses, and taking more than prescribed will not relieve your symptoms.')
            doc.moveDown(1);
            doc.text('If you take buprenorphine daily your body will develop a physical dependence to it. Once you have stabilized on it, if you discontinue buprenorphine it suddenly, you will likely experience withdrawal.')
            doc.moveDown(1);
            doc.text('The most common side effects of buprenorphine are headache, nausea, sedation and constipation. These side effects tend to get better over time as your body adjusts to the medication. You need to discuss these with your medical provider so they can help y ou to manage these side effects safely.')
            doc.moveDown(1);
            doc.text('Combining buprenorphine with alcohol or other sedating medications is dangerous. The combination of buprenorphine with benzodiazepines (such as Xanax, Valium, Ativan, Klonopin, etc.) has resulted in death.')
            doc.moveDown(1);
            doc.text('Buprenorphine tablets and strips must be held under the tongue until they dissolve completely which can take 15 minutes. Do not eat or drink anything for at least 30 minutes after taking buprenorphine. If you swallow buprenorphine it will not be properly absorbed and it will not work well.')
            doc.moveDown(1);
            doc.text('I understand that I have been prescribed a medication that will cause drug dependency and can be misused. To help reduce my risk of harm from these medications I agree to the following rules (please check the following boxes):')
            doc.moveDown(2);

            drawHorizontalLine(doc.y + 0);

            doc.moveDown(1);

            doc.text('My medical provider has explained the risks, benefits and alternatives to buprenorphine treatment. This question is required.*')
             if (data.bupe_risks_explained) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('I understand that buprenorphine can only be prescribed by a specially licensed medical professional (buprenorphine provider). I can only get buprenorphine refills during scheduled office visits with my buprenorphine provider and I will not be able to obtain buprenorphine refills during walk in visits, from the emergency room, or after regular clinic hours. If I am unable to make it to my scheduled appointment, I must notify Rume Wellness 24 hours prior (or ASAP in an emergency situation) to make arrangements. I understand that I cannot get any early refills on my medication.This question is required.*')
            if (data.bupe_refill_policy_agreement) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('I understand that Rume Wellness office hours are: Monday – Friday 8: 00 am – 4:30pm This question is required.*')
            if (data.office_hours_agreement) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('I will take buprenorphine only as prescribed by my medical provider. I will not take buprenorphine prescribed for someone else. I will take my prescribed dose daily and I will not adjust the dose on my own. If I wish a dosage change, I will discuss this with the medical provider during my appointment. I understand that if any member of Rume Wellness’s treatment team receives information that I have been involved with any kind of diversion (selling, giving away or sharing buprenorphine with another patient), I may be transitioned to monthly injectable buprenorphine or ref erred for a higher level of specialty care. This question is required.*')
            if (data.medication_use_agreement) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('I agree to inform my treatment provider, whether in outpatient treatment, inpatient treatment, in the ER, or in a dental office that I am taking prescribed buprenorphine and participating in an MAT program as part of the intake information. This question is required.*')
            if (data.medical_disclosure_agreement) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('I agree to contact Rume Wellness program IMMEDIATELY if I experience a medical emergency that necessitates the use of opioid pain medication. I agree to allow my buprenorphine prescriber to provide consultation, where necessary, to any other medical provider who is recommending the use of opioid pain medication or a benzodiazepine or need for anesthesia.This question is required.*')
            if (data.emergency_contact_agreement) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('I understand that dental treatment, including tooth extraction, is not a reason to use opioid pain medication since better pain relief can be accomplished in other ways. Use of pain medication for dental treatment will be considered a relapse on opioid medication.This question is required.*')
            if (data.dental_treatment_agreement) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('I understand that to participate Rume Wellness’s treatment program, I must be willing to work towards abstinence from all mind - altering substances, and alcohol. I agree to work on abstinence from all substances with understanding that it may take some time to reach the goal of complete abstinence.This question is required.*')
            if (data.abstinence_agreement) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('As required by California State law, I understand that I am giving consent for random pharmacy checks. The discovery of controlled substance being dispensed to me without the explicit knowledge of Rume Wellness is cause for immediate referral to a higher level of care.This question is required.*')
            if (data.pharmacy_check_consent) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('I will comply with all the required medication counts and urine tests. Urine testing is a mandatory part of office maintenance visits; I agree to be prepared to give a urine sample for testing for opioid s and other drugs, including the presence of buprenorphine and its metabolites at each clinic visit. I agree to show my current medication bottles for a pill count - including reserve medications, if asked. Urine testing will occur at each appointment or per medical provider’s request and may be witnessed.This question is required.*')
            if (data.medication_count_agreement) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('I will attend all scheduled appointments and will call to cancel within 24 hours if I am unable to attend.This question is required.*')
            if (data.appointment_agreement) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('I agree to store medication properly. Medication may be harmful to children, household members, and pets. The films/pills will be stored in a safe place (preferably locked) out of the reach of children. If anyone besides me ingests this medication I will call 911 immediately for medical assistance.This question is required.*')
            if (data.medication_storage_agreement) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('\n' +
                'I agree to notify my medical provider immediately if my medication is lost or stolen. If my medication is stolen, I must furnish a copy of the police report to add to my medical record.This question is required.*')
            if (data.stolen_reporting_agreement) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('I will notify my medical provider immediately if I use any controlled substances. Relapse to opioids can be life threatening and an appropriate treatment plan must be developed as soon as possible. I will tell my medical provider about a relapse BEFORE any urine test shows use. If I do not inform my treatment team about use of a substance, and there is a positive result on a urine screen, this may be a cause for a change to my plan of care.This question is required.*')
            if (data.relapse_reporting_agreement) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('I understand that buprenorphine treatment does not work for everyone, and if my medical provider determines that I am no longer receiving appropriate benefit from the medication they reserve the right to discontinue the medication at any time.This question is required.*')
            if (data.treatment_discontinuation_understanding) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('I understand the risk of relapse to opioid use after stopping buprenorphine can be as high as 95%, and that I should not stop taking my medication without speaking with my medical provider to make an appropriate withdrawal management and follow up care plan.This question is required.*')
            if (data.relapse_risk_understanding) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('I understand that if I stop taking buprenorphine and resume opioid use that my risk of opioid overdose death is high. I agree to always keep a naloxone rescue kit with me and to teach my friends and family how to use it.This question is required.*')
            if (data.overdose_risk_understanding) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('I understand that my treatment team recommends that I be involved in a chemical dependency treatment program. Participation in a community - based program (such as AA, NA) while I am taking buprenorphine is also highly recommended.This question is required.*')
            if (data.treatment_program_recommendation) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('My provider has recommended that I obtain my buprenorphine from a single pharmacy. The clinic does not keep any buprenorphine in stock. I am responsible for paying for my own medications.This question is required.*')
            if (data.pharmacy_recommendation_agreement) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('I agree to conduct myself in a courteous manner in the medical provider’s office. Lewd, rude or threatening comments made to staff will result in termination from the program.This question is required.*')
            if (data.conduct_agreement) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('I understand that buprenorphine can cause drowsiness and it may be dangerous to operate a motor vehicle or heavy equipment while taking it. I will not operate a motor vehicle until I have a better understanding of how buprenorphine will affect me.This question is required.*')
            if (data.motor_vehicle_safety_agreement) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('(Female Patietnts Only) I understand that buprenorphine/naloxone has unknown safety in pregnancy and plain buprenorphine is currently recommended instead. I agree to develop a contraception plan with my provider so that I do not become pregnant during treatment. If I become pregnant I will tell my provider right away so that medication adjustments can be made. This question is required.*')
            if (data.pregnancy_medication_agreement) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('\n' +
                'I agree to a sign a release of information and consent to a coordination of care phone call for any other providers that are prescribing a controlled substance. This is for patient safety and coordination of care calls are always conducted in a courteous and compassionate with the goal of preserving the relationship with all health care providers.This question is required.*')
            if (data.care_coordination_agreement) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('\n' +
                'I have reviewed the outline of Rume Wellness ’s outpatient based opioid treatment program thoroughly. I have had the opportunity to ask questions regarding the program and have had them answered by my treatment team. I agree to abide by all the rules and expectations reviewed and signed by me. This question is required.*')
            if (data.program_rules_agreement) {
                doc.text(`I accept`, {font: 'Inter-Bold'});
            } else {
                doc.text('I do not accept');
            }
            doc.moveDown(1);
            doc.text('By typing your name you confirm that you or someone you have authorized has completed this form.This question is required.*')
            doc.text(data.signature)
            doc.moveDown(2);
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}