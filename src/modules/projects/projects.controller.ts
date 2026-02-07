import { Body, Controller, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';



@Controller('projects')
export class ProjectsController {

    constructor(private projectService: ProjectsService){}
    
    @Post('/getProjects')
    async getProjects(@Body() body: any) {
       return await this.projectService.getProjects(body);
    }

    @Post('/createProject')
    async createStudy(@Body() body: any) {
       console.log("🚀 ~ ProjectsController ~ createStudy ~ body:", body)
       return await this.projectService.createProject(body);
    }

}
