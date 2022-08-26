# Attendance Counter

This is a semi-automatic gadget for reducing the workload of the boring attendance counting task.

## Usage

1. Clone the repository and install dependencies.

   ```bash
   git clone https://github.com/yflyl613/Attendance-Counter.git
   cd SignIn-Counter
   yarn install
   ```

2. Register a [Baidu](https://cloud.baidu.com/) account and get the free [resources](https://console.bce.baidu.com/ai/#/ai/ocr/overview/resource/getFree), which includes 500 free requests per month of the OCR service.

3. [Create](https://console.bce.baidu.com/ai/#/ai/ocr/app/create) a new application and copy its `API KEY` and `SECRET KEY` to `Attendance-Counter/src/config.js`.

4. Run the app on [http://localhost:8080/](http://localhost:8080/).

   ```bash
   # Under Attendance-Counter
   yarn serve
   ```

5. Take pictures of the attendance forms with a scanning app such as [扫描全能王](https://apps.apple.com/cn/app/%E6%89%AB%E6%8F%8F%E5%85%A8%E8%83%BD%E7%8E%8B-%E6%89%8B%E6%9C%BA%E6%89%AB%E6%8F%8F%E4%BB%AA-pdf%E5%9B%BE%E7%89%87%E8%BD%AC%E6%96%87%E5%AD%97/id388627783) and upload it to the app.

6. Click the `Start Process` button and check the recognition results. Click these cells with content if they are missed by the OCR service.

7. After checking the recognition results of all the pictures, you will get the counting result and you can export it to a `Excel` file with the `Export` button.
