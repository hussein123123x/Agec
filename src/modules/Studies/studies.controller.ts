import { Body, Controller, Post, Put, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { StudiesService } from './studies.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';


@Controller('study')
export class StudiesController {

    constructor(private studyService: StudiesService){}
    
    @Post('/getStudies')
    async getStudies(@Body() body: any) {
       return await this.studyService.getStudies(body);
    }

    @Post('/createStudy')
    async createStudy(@Body() body: any) {
       return await this.studyService.createStudy(body);
    }

     @Put('updateStudy')
    async updateStudy(@Body() body: any) {
        console.log("🚀 ~ StudiesController ~ updateStudy ~ body:", body);

        const { id, username , ...updateData} = body;
        console.log("🚀 ~ StudiesController ~ updateStudy ~ username:", username)

        if (!id) {
        throw new Error('Document ID is required for update');
        }

        return await this.studyService.updateStudy(id, updateData, username);
    }

    @Post('uploadStudyFiles')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'financialModelFile', maxCount: 1 },
        { name: 'extraFiles', maxCount: 10 },
    ]))
    async uploadStudyFiles(
        @UploadedFiles() files: { financialModelFile?: Express.Multer.File[], extraFiles?: Express.Multer.File[] },
        @Body() body: any
    ) {
        return await this.studyService.uploadStudyFiles(files, body);
    }
}
