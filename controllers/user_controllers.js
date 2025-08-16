
const admission_model = require('../models/admission_model');


const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs/promises');
const path = require('path');


const userLogin = (req, res) => {

    res.render('../Views/user_credential')
};

const studentMarksheet = async (req, res) => {

    const studentSourse = await admission_model.findById(req.params.id).populate('result')

    res.render('../Views/student_dsahboard', { studentSourse })
}

const userLoginPost = async (req, res) => {

    const { roll_no, DOB } = req.body;
    const studentrollNo = await admission_model.findOne({ roll_no: roll_no });

    if (studentrollNo) {

        const matchDOB = await admission_model.findOne({ DOB: DOB });
        if (matchDOB) {

            return res.redirect(`/JUK/student-result/${studentrollNo._id}`)
        }

        else {

            req.flash('error', 'DOB is not matching');
            return res.redirect('/JUK/student-login')
        }
    }

    else {
        req.flash('error', 'Student is not exist');
        return res.redirect('/JUK/student-login')
    }
}

const downloadMarksheetStudent = async (req, res) => {

    const studentSourse = await admission_model
        .findById(req.params.id)
        .populate('result');

    const inputPdfPath = path.join(__dirname, '../Result_format/Result.pdf');
    const existingPdfBytes = await fs.readFile(inputPdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const firstPage = pdfDoc.getPage(0);
    const { height } = firstPage.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    firstPage.drawText(`Name: ${studentSourse.Name}`, { x: 50, y: height - 240, size: 14, font });
    firstPage.drawText(`Roll No: ${studentSourse.roll_no}`, { x: 50, y: height - 260, size: 14, font });

    let yPos = height - 300;
    firstPage.drawText(`Subject`, { x: 50, y: yPos, size: 14, font });
    firstPage.drawText(`Marks`, { x: 300, y: yPos, size: 14, font });
    yPos -= 20;



    studentSourse.result.forEach((r) => {
        r.marksheet.forEach((m) => {
            firstPage.drawText(m.subject, { x: 50, y: yPos, size: 12, font });
            firstPage.drawText(m.mark.toString(), { x: 300, y: yPos, size: 12, font });
            yPos -= 20;
        });
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${studentSourse.Name}_result.pdf"`);
    res.send(Buffer.from(pdfBytes));
};






module.exports = { downloadMarksheetStudent, userLoginPost, userLogin, studentMarksheet };